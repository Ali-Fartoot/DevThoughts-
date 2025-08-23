from minio import Minio
from minio.error import S3Error
import os

class MinioClient():
    def __init__(self):

        self.client = Minio(
            f"{os.getenv("MINIO_URL")}:{os.getenv("MINIO_PORT")}",
            access_key=os.getenv("MINIO_ROOT_USER"),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD"),
            secure=False
        )

    @classmethod
    def get_client(cls):
        return cls()

    def _add_object(self, bucket_name, object_name, file_path):
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)

            self.client.fput_object(
                bucket_name,
                object_name,
                file_path
            )
            return True
        
        except S3Error as e:
            print("minio error occured while adding object: ", e)
            return False
    
    def delete_object(self, bucket_name, object_name):
        try:
            if not self.client.bucket_exists(bucket_name):
                print(f"The bucket with name {bucket_name} dosen't exist!")
                return False
            
            self.client.remove_object(bucket_name, object_name)
            return True
    
        except S3Error as e:
            print("minio error occured while delete: ", e)
            return False
        
    def put_object(self, bucket_name, object_name, file_path):
        try:
            if self.delete_object(bucket_name, object_name):
                print(f"The {bucket_name} exist Updating...")

                if self._add_object(bucket_name, object_name, file_path):
                    return True
            else:
                print(f"The {bucket_name} dosen't exist! Creating...")
                if self._add_object(bucket_name, object_name, file_path):
                    return True
                return False

        except S3Error as e:
            print("minio error occured while updating: ", e)
            return False

        
    def get_object(self, bucket_name, object_name, file_path):
        try:
            response = self.client.fget_object(bucket_name,
                                               object_name,
                                               file_path
            )
            print(f"Successfully downloaded {object_name} from bucket {bucket_name} to {file_path}")
            return response
        
        except Exception as e:
              print(f"Failed to download {object_name}: {str(e)}")
              return None