import hashlib
from datetime import datetime
def hash_with_current_time(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    data += f"_{datetime.now()}".encode('utf-8')

    sha256_hash = hashlib.sha256(data).hexdigest()
    return sha256_hash
    
    
    