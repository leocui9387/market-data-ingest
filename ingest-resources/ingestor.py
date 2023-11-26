import boto3
import os
import json
#import requests
import datetime as dt

def lambda_handler(event, context): 
    print(event)
    print("BUCKET:",os.environ["BUCKET"])


    s3 = boto3.client('s3')
    json_object = {"test":"thing"}
    s3.put_object(
        Body=json.dumps(json_object),
        Bucket=os.environ["BUCKET"],
        Key=f"testthing={dt.datetime.now().isoformat()}.json"
    )

    return {"body":"Success", "status_code":200}