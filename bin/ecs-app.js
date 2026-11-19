#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var cdk = require("aws-cdk-lib");
var ecs_fullstack_stack_1 = require("../lib/ecs-fullstack-stack");
var app = new cdk.App();
// Environment configuration (Optional but recommended)
var env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1'
};
new ecs_fullstack_stack_1.EcsFullStackStack(app, 'EcsFullStackStack', {
    env: env,
    /* If you need to pass specific props, define them here */
});
