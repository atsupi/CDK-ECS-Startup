#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcsFullStackStack } from '../lib/ecs-fullstack-stack';

const app = new cdk.App();

// Environment configuration (Optional but recommended)
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1' 
};

new EcsFullStackStack(app, 'EcsFullStackStack', {
  env: env,
  /* If you need to pass specific props, define them here */
});
