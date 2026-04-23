import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class EcsFullStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC: Remove NAT Gateway to minimize costs
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [{ name: 'Public', subnetType: ec2.SubnetType.PUBLIC }],
    });

    // 2. DynamoDB: Persistence for ToDo data
    const table = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For learning purposes
    });

    // 3. ECS Cluster
    const cluster = new ecs.Cluster(this, 'MyCluster', { vpc });

    // 4. Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true,
    });
    const listener = alb.addListener('Listener', { port: 80 });

    // 5. Backend Service (Node.js)
    const backendTask = new ecs.FargateTaskDefinition(this, 'BackendTask', {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    
    backendTask.addContainer('BackendContainer', {
      image: ecs.ContainerImage.fromAsset('./backend'),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        TABLE_NAME: table.tableName,
        REGION: this.region,
      },
    });
    // Grant permissions to the Task Role
    table.grantReadWriteData(backendTask.taskRole); 

    const backendService = new ecs.FargateService(this, 'BackendService', {
      cluster,
      taskDefinition: backendTask,
      assignPublicIp: true, // Required for communication via IGW without NAT Gateway
    });

    // 6. Frontend Service (React + Nginx)
    const frontendTask = new ecs.FargateTaskDefinition(this, 'FrontendTask', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    frontendTask.addContainer('FrontendContainer', {
      image: ecs.ContainerImage.fromAsset('./frontend'),
      portMappings: [{ containerPort: 8080 }],
    });

    const frontendService = new ecs.FargateService(this, 'FrontendService', {
      cluster,
      taskDefinition: frontendTask,
      assignPublicIp: true,
    });

    // 7. Path-based Routing configuration
    // Default target (Frontend)
    listener.addTargets('FrontendTarget', {
      port: 80,
      targets: [frontendService],
    });

    // Forward /api/* requests to Backend
    listener.addTargets('BackendTarget', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      port: 80,
      targets: [backendService],
      healthCheck: { path: '/api/health' }, 
    });

    // Output the ALB DNS Name
    new cdk.CfnOutput(this, 'ALBURL', { value: `http://${alb.loadBalancerDnsName}` });
  }
}
