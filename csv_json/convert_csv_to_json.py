import csv
import json
from datetime import datetime
from collections import defaultdict
import os

# File paths
input_file = 'data/eth/input/eth_15m_data_2017_to_2025.csv'
output_dir = 'data/eth/output'

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Dictionary to store data by year
data_by_year = defaultdict(list)

# Read CSV file and group by year
print(f"Reading CSV file: {input_file}")
with open(input_file, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    
    for row in reader:
        # Parse the date to extract year
        open_time_str = row['Open time']
        
        # Parse different possible date formats
        try:
            # Try format: "8/17/2017 4:00" or "12/21/2025 22:15"
            if '/' in open_time_str:
                # Handle format like "8/17/2017 4:00"
                # Parse the full datetime with time component
                datetime_obj = datetime.strptime(open_time_str, '%m/%d/%Y %H:%M')
            else:
                # Handle ISO format if needed
                datetime_obj = datetime.fromisoformat(open_time_str)
            
            # Convert to Unix timestamp (seconds since epoch)
            unix_timestamp = int(datetime_obj.timestamp())
            year = datetime_obj.year
            
            # Convert to compact array format: [Timestamp (Unix), Open, High, Low, Close]
            record = [
                unix_timestamp,
                float(row['Open']),
                float(row['High']),
                float(row['Low']),
                float(row['Close'])
            ]
            
            data_by_year[year].append(record)
            
        except (ValueError, KeyError) as e:
            print(f"Warning: Could not parse row: {row}. Error: {e}")
            continue

# Write JSON files for each year (compact format, no indentation to optimize file size)
print(f"\nWriting JSON files to: {output_dir}")
for year in sorted(data_by_year.keys()):
    output_file = os.path.join(output_dir, f'{year}.json')
    with open(output_file, 'w', encoding='utf-8') as jsonfile:
        json.dump(data_by_year[year], jsonfile, ensure_ascii=False)
    
    print(f"  Created {year}.json with {len(data_by_year[year])} records")

print(f"\nConversion complete! Created {len(data_by_year)} JSON files.")

