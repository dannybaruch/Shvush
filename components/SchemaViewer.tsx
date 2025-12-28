
import React from 'react';

const SchemaViewer: React.FC = () => {
  const sqlSchema = `
-- multi-tenancy enforced with institution_id on every table

CREATE TABLE Institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trial_expiry_date TIMESTAMP NOT NULL, -- Calculated as signup_date + 30 days
    is_active BOOLEAN DEFAULT TRUE,
    has_payment_method BOOLEAN DEFAULT FALSE
);

CREATE TYPE SourceType AS ENUM ('בוגר', 'כנס', 'מודעה', 'חבר');
CREATE TYPE StageType AS ENUM ('פנייה ראשונית', 'נוצר קשר', 'ביקור', 'שלב ההחלטה', 'סגור');
CREATE TYPE StatusType AS ENUM ('התקבל/ניצחון', 'ויתר/הפסד');

CREATE TABLE Candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES Institutions(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL, -- שם מלא
    phone VARCHAR(50), -- טלפון
    current_yeshiva VARCHAR(255), -- מוסד נוכחי
    source SourceType NOT NULL,
    stage StageType NOT NULL,
    status StatusType NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE InteractionType AS ENUM ('טלפון', 'וואטסאפ', 'פגישה', 'מייל');

CREATE TABLE Interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES Candidates(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES Institutions(id), -- multi-tenancy
    type InteractionType NOT NULL,
    summary TEXT, -- סיכום שיחה
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_inst ON Candidates(institution_id);
CREATE INDEX idx_interactions_inst ON Interactions(institution_id);
  `;

  return (
    <div className="bg-slate-900 text-slate-100 p-6 rounded-xl shadow-2xl overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-blue-400">Database Schema (SQL)</h3>
      <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
        {sqlSchema}
      </pre>
    </div>
  );
};

export default SchemaViewer;
