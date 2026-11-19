"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcsFullStackStack = void 0;
var cdk = require("aws-cdk-lib");
var ec2 = require("aws-cdk-lib/aws-ec2");
var ecs = require("aws-cdk-lib/aws-ecs");
var elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
var dynamodb = require("aws-cdk-lib/aws-dynamodb");
var EcsFullStackStack = /** @class */ (function (_super) {
    __extends(EcsFullStackStack, _super);
    function EcsFullStackStack(scope, id, props) {
        var _this = _super.call(this, scope, id, props) || this;
        // 1. VPC: Remove NAT Gateway to minimize costs
        var vpc = new ec2.Vpc(_this, 'MyVpc', {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{ name: 'Public', subnetType: ec2.SubnetType.PUBLIC }],
        });
        // 2. DynamoDB: Persistence for ToDo data
        var table = new dynamodb.Table(_this, 'TodoTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For learning purposes
        });
        // 3. ECS Cluster
        var cluster = new ecs.Cluster(_this, 'MyCluster', { vpc: vpc });
        // 4. Application Load Balancer
        var alb = new elbv2.ApplicationLoadBalancer(_this, 'MyALB', {
            vpc: vpc,
            internetFacing: true,
        });
        var listener = alb.addListener('Listener', { port: 80 });
        // 5. Backend Service (Node.js)
        var backendTask = new ecs.FargateTaskDefinition(_this, 'BackendTask', {
            cpu: 256,
            memoryLimitMiB: 512,
        });
        backendTask.addContainer('BackendContainer', {
            image: ecs.ContainerImage.fromAsset('./backend'),
            portMappings: [{ containerPort: 3000 }],
            environment: {
                TABLE_NAME: table.tableName,
                REGION: _this.region,
            },
        });
        // Grant permissions to the Task Role
        table.grantReadWriteData(backendTask.taskRole);
        var backendService = new ecs.FargateService(_this, 'BackendService', {
            cluster: cluster,
            taskDefinition: backendTask,
            assignPublicIp: true, // Required for communication via IGW without NAT Gateway
        });
        // 6. Frontend Service (React + Nginx)
        var frontendTask = new ecs.FargateTaskDefinition(_this, 'FrontendTask', {
            cpu: 256,
            memoryLimitMiB: 512,
        });
        var frontendLogGroup = new cdk.aws_logs.LogGroup(_this, 'FrontendLogGroup', {
            logGroupName: '/ecs/frontend-logs',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
        });
        frontendTask.addContainer('FrontendContainer', {
            image: ecs.ContainerImage.fromAsset('./frontend'),
            portMappings: [{ containerPort: 8080 }],
            logging: ecs.LogDrivers.awsLogs({
                logGroup: frontendLogGroup,
                streamPrefix: 'ecs',
            }),
        });
        var frontendService = new ecs.FargateService(_this, 'FrontendService', {
            cluster: cluster,
            taskDefinition: frontendTask,
            assignPublicIp: true,
        });
        // 7. Path-based Routing configuration
        // Default target (Frontend)
        listener.addTargets('FrontendTarget', {
            port: 8080,
            targets: [frontendService],
            healthCheck: {
                path: '/',
                port: '8080'
            },
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
        new cdk.CfnOutput(_this, 'ALBURL', { value: "http://".concat(alb.loadBalancerDnsName) });
        return _this;
    }
    return EcsFullStackStack;
}(cdk.Stack));
exports.EcsFullStackStack = EcsFullStackStack;
