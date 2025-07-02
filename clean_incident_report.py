import csv

input_file = 'assets/incident_report.csv'
output_file = 'assets/incident_report_cleaned.csv'

with open(input_file, 'r', newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    for row in reader:
        # Check if the 6th column (index 5) is not empty and not '0000-00-00'
        if len(row) > 5 and row[5] and row[5] != '0000-00-00':
            writer.writerow(row)

print(f"Cleaned data saved to {output_file}") 