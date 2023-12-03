const { Stack, Duration } = require('aws-cdk-lib');

// const sqs = require('aws-cdk-lib/aws-sqs');

const s3 = require('aws-cdk-lib/aws-s3');
const lambda = require('aws-cdk-lib/aws-lambda');
const targets = require('aws-cdk-lib/aws-events-targets');
const events = require('aws-cdk-lib/aws-events');
const iam = require('aws-cdk-lib/aws-iam');

const params = require("../parameters.json");


class MarketDataIngestStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const dataBucket = s3.Bucket.fromBucketArn(this, 'basic-bear-market-data', params.s3_bucket_arn);
    
    const dataIngestor = new lambda.Function(this, "data-ingestor", {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset("ingest-resources"),
      handler: "ingestor.lambda_handler",
      environment: {BUCKET: dataBucket.bucketName},
      
    });
    
    const dataIngestorRolePolicy = new iam.PolicyStatement();
    dataIngestorRolePolicy.addResources([dataBucket.bucketArn]);
    dataIngestorRolePolicy.addActions(["s3:PutObject"]);
    
    dataIngestor.addToRolePolicy(dataIngestorRolePolicy);    
    dataBucket.grantPut(dataIngestor.role);

    const schedule_rule = new events.Rule(this, "DailyDataTrigger",{
      schedule: events.Schedule.cron({hour:"8", minute:"0"}),
    });

    schedule_rule.addTarget(new targets.LambdaFunction(dataIngestor));

  }
}

module.exports = { MarketDataIngestStack }
