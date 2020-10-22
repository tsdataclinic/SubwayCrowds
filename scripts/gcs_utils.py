from google.cloud import storage
from typing import List
import pandas as pd
import os


class gcs_util:
    """
    Convenience class for managing google cloud storage.
    Really more out of laziness than necessity.
    """
    def __init__(self, bucket_path: str = data_clinic_bucket):
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_path)

        
    def list_dirs(self, dir:str = None):     
        """
        Lists only directories in the blob name, not blobs
        list_prefixes(prefix="foodir/")
        """
        if not (dir is None or dir.endswith("/")):
            dir += "/"
            
        iterator = self.bucket.list_blobs(prefix=dir,delimiter="/")                            
        response = iterator._get_next_page_response()
        if 'prefixes' in response:            
            return response['prefixes']
        return []

    def list_blobs(self, dir:str = None):
        """
        Lists all blobs
        list_blobs(prefix="foodir/")
        """        
        return list(self.bucket.list_blobs(prefix=dir))

    def upload_dataframe(self, df: pd.DataFrame, blob_path:str):
        temp_path = 'df.pkl'
        try:
            df.to_pickle('df.pkl')
            self.upload_blob(blob_path, temp_path)
        finally:
            os.remove(temp_path)

    def upload_blob(self, blob_path: str, file_path: str):
        blob = self.bucket.blob(blob_path)
        blob.upload_from_filename(file_path)

    def read_dataframe(self, blob_path: str) -> pd.DataFrame:
        temp_path = 'temp.parquet'
        blob = self.get_blob(blob_path)
        try:
            blob.download_to_filename(temp_path)
            return pd.read_parquet(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def get_blob(self, blob_path: str) -> str:
        return self.bucket.get_blob(blob_path)


    def delete_blob(self, blob_path: str):
        blob = self.bucket.get_blob(blob_path)
        blob.delete()

    def delete_blob_dir(self, blob_prefix: str) -> List[str]:
        deleted_blobs = []
        for blob in self.bucket.list_blobs(prefix=blob_prefix):
            deleted_blobs.append(blob.path)
            blob.delete()
        return deleted_blobs