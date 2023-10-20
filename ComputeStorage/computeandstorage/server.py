import grpc
from concurrent import futures
import computeandstorage_pb2
import computeandstorage_pb2_grpc
import boto3

AWS_ACCESS_KEY = 'ASIARPPBFXJT6HWQQGYK'
AWS_SECRET_KEY = 'ZNHeR1jJ4XxFHbO7Ag3KgFzZWgUHw/3z4ZOBI1It'
AWS_SESSION_TOKEN = 'FwoGZXIvYXdzEG0aDKvMwAu5Up+lAP4X4yLAATn0jMwHxoVfgNcaK62d/C4qyzF9jpVKMy+l/DAZLdJCBRZXXuydcHRzn7d1sCHekH7i6Q0dxKfyaZz/ar25a3AYfwojD9qBQ5O3QK+M0XHTf2G+zJN6hITbVzfWQjKe79WAsj/IpJQD18wmqQjxNFMfu4s9PnU4mFRiToZMAK1phA+mFO4s39Ma/UvhHDsb+LVgGUzJ4kpNWEDv1zA92GDMsd+K2H8yGvtc2y4xfM/ZpJU1z70D2ZDXPeRZJsANiSjmtJGkBjItsGdD1CsLJ9DquLS5Wn1vGhuYTYvbqI3lzGNQF2fJbisL0nnwdPsYv7uJNPdT'

S3_BUCKET_NAME = 'computeandstorage'
S3_FILE_NAME = 'ec2s3.txt'

def store_data(data):
    s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, aws_session_token=AWS_SESSION_TOKEN)

    response = s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=S3_FILE_NAME, Body=data)

    url = s3_client.generate_presigned_url('get_object', Params={'Bucket': S3_BUCKET_NAME, 'Key': S3_FILE_NAME})

    return url

def append_data(data):
    s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, aws_session_token=AWS_SESSION_TOKEN)

    response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=S3_FILE_NAME)
    existing_data = response['Body'].read().decode('utf-8')

    updated_data = existing_data + data

    response = s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=S3_FILE_NAME, Body=updated_data)
    url = s3_client.generate_presigned_url('get_object', Params={'Bucket': S3_BUCKET_NAME, 'Key': S3_FILE_NAME})

    return url

def delete_file(url):
    
    file_name = url.split('/')[-1].split('?')[0]
    s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, aws_session_token=AWS_SESSION_TOKEN)
    response = s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=file_name)

class EC2OperationsServicer(computeandstorage_pb2_grpc.EC2OperationsServicer):
    def StoreData(self, request, context):
        data = request.data
        url = store_data(data)
        return computeandstorage_pb2.StoreReply(s3uri=url)

    def AppendData(self, request, context):
        data = request.data
        url = append_data(data)
        return computeandstorage_pb2.AppendReply()

    def DeleteFile(self, request, context):
        url = request.s3uri.strip('{}')
        delete_file(url)
        return computeandstorage_pb2.DeleteReply()

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    computeandstorage_pb2_grpc.add_EC2OperationsServicer_to_server(EC2OperationsServicer(), server)
    server.add_insecure_port('0.0.0.0:8998')
    print("Server started, listening on 0.0.0.0:8998")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
