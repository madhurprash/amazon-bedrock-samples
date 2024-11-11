import pandas as pd
import numpy as np
import boto3
import sagemaker
from sagemaker import AutoML

# Load the data
df = pd.read_csv('nyc_taxi_subset.csv')

# Display the first few rows and data info
print(df.head())
print(df.info())