-- Create disaster_reports table
CREATE TABLE IF NOT EXISTS disaster_reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    reported_by INTEGER NOT NULL REFERENCES users(id),
    contact_number VARCHAR(20),
    images TEXT[], -- Array of image URLs
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_disaster_reports_status ON disaster_reports(status);
CREATE INDEX idx_disaster_reports_reported_by ON disaster_reports(reported_by);
CREATE INDEX idx_disaster_reports_district ON disaster_reports(district);
CREATE INDEX idx_disaster_reports_type ON disaster_reports(type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_disaster_reports_updated_at
    BEFORE UPDATE ON disaster_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 