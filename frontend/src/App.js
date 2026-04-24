import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIOnlyPage from './pages/AIOnlyPage';

const features = [
  {
    path: 'persons',
    table: 'persons',
    name: 'Person Records',
    columns: [{key:'first_name',label:'First Name'},{key:'last_name',label:'Last Name'},{key:'birth_date',label:'Birth Date'},{key:'death_date',label:'Death Date'},{key:'birth_place',label:'Birth Place'},{key:'gender',label:'Gender'}],
    formFields: [{key:'first_name',label:'First Name',type:'text'},{key:'last_name',label:'Last Name',type:'text'},{key:'birth_date',label:'Birth Date',type:'date'},{key:'death_date',label:'Death Date',type:'date'},{key:'birth_place',label:'Birth Place',type:'text'},{key:'death_place',label:'Death Place',type:'text'},{key:'gender',label:'Gender',type:'select',options:['Male','Female','Other']},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'family-trees',
    table: 'family_trees',
    name: 'Family Trees',
    columns: [{key:'name',label:'Name'},{key:'description',label:'Description'}],
    formFields: [{key:'name',label:'Tree Name',type:'text'},{key:'description',label:'Description',type:'textarea'}]
  },
  {
    path: 'historical-records',
    table: 'historical_records',
    name: 'Historical Records',
    aiFeature: 'historical-records',
    columns: [{key:'title',label:'Title'},{key:'record_type',label:'Type'},{key:'date',label:'Date'},{key:'location',label:'Location'},{key:'person_name',label:'Person'}],
    formFields: [{key:'title',label:'Title',type:'text'},{key:'record_type',label:'Record Type',type:'text'},{key:'date',label:'Date',type:'date'},{key:'location',label:'Location',type:'text'},{key:'description',label:'Description',type:'textarea'},{key:'source',label:'Source',type:'text'},{key:'person_name',label:'Person Name',type:'text'}]
  },
  {
    path: 'dna-matches',
    table: 'dna_matches',
    name: 'DNA Matches',
    aiFeature: 'dna-analysis',
    columns: [{key:'match_name',label:'Match Name'},{key:'relationship',label:'Relationship'},{key:'confidence_pct',label:'Confidence %'},{key:'shared_cm',label:'Shared cM'},{key:'platform',label:'Platform'}],
    formFields: [{key:'match_name',label:'Match Name',type:'text'},{key:'relationship',label:'Relationship',type:'text'},{key:'confidence_pct',label:'Confidence %',type:'number'},{key:'shared_cm',label:'Shared cM',type:'number'},{key:'shared_segments',label:'Shared Segments',type:'number'},{key:'platform',label:'Platform',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'census-records',
    table: 'census_records',
    name: 'Census Records',
    aiFeature: 'census-search',
    columns: [{key:'year',label:'Year'},{key:'state',label:'State'},{key:'county',label:'County'},{key:'head_of_household',label:'Head of Household'},{key:'members',label:'Members'}],
    formFields: [{key:'year',label:'Year',type:'number'},{key:'state',label:'State',type:'text'},{key:'county',label:'County',type:'text'},{key:'city',label:'City',type:'text'},{key:'head_of_household',label:'Head of Household',type:'text'},{key:'members',label:'Members',type:'number'},{key:'occupation',label:'Occupation',type:'text'},{key:'address',label:'Address',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'immigration-records',
    table: 'immigration_records',
    name: 'Immigration Records',
    aiFeature: 'immigration-analysis',
    columns: [{key:'immigrant_name',label:'Name'},{key:'origin_country',label:'Origin'},{key:'destination',label:'Destination'},{key:'arrival_date',label:'Arrival Date'},{key:'ship_name',label:'Ship'}],
    formFields: [{key:'immigrant_name',label:'Immigrant Name',type:'text'},{key:'origin_country',label:'Origin Country',type:'text'},{key:'destination',label:'Destination',type:'text'},{key:'arrival_date',label:'Arrival Date',type:'date'},{key:'ship_name',label:'Ship Name',type:'text'},{key:'port_of_arrival',label:'Port of Arrival',type:'text'},{key:'age_at_arrival',label:'Age at Arrival',type:'number'},{key:'occupation',label:'Occupation',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'birth-death-records',
    table: 'birth_death_records',
    name: 'Birth & Death Records',
    aiFeature: 'birth-death-analysis',
    columns: [{key:'person_name',label:'Person'},{key:'record_type',label:'Type'},{key:'event_date',label:'Date'},{key:'location',label:'Location'},{key:'state',label:'State'}],
    formFields: [{key:'person_name',label:'Person Name',type:'text'},{key:'record_type',label:'Type',type:'select',options:['birth','death']},{key:'event_date',label:'Event Date',type:'date'},{key:'location',label:'Location',type:'text'},{key:'county',label:'County',type:'text'},{key:'state',label:'State',type:'text'},{key:'certificate_number',label:'Certificate Number',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'marriage-records',
    table: 'marriage_records',
    name: 'Marriage Records',
    aiFeature: 'marriage-analysis',
    columns: [{key:'spouse1_name',label:'Spouse 1'},{key:'spouse2_name',label:'Spouse 2'},{key:'marriage_date',label:'Date'},{key:'location',label:'Location'},{key:'state',label:'State'}],
    formFields: [{key:'spouse1_name',label:'Spouse 1 Name',type:'text'},{key:'spouse2_name',label:'Spouse 2 Name',type:'text'},{key:'marriage_date',label:'Marriage Date',type:'date'},{key:'location',label:'Location',type:'text'},{key:'county',label:'County',type:'text'},{key:'state',label:'State',type:'text'},{key:'officiant',label:'Officiant',type:'text'},{key:'witnesses',label:'Witnesses',type:'textarea'},{key:'certificate_number',label:'Certificate Number',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'military-records',
    table: 'military_records',
    name: 'Military Records',
    aiFeature: 'military-analysis',
    columns: [{key:'service_member',label:'Service Member'},{key:'branch',label:'Branch'},{key:'rank_val',label:'Rank'},{key:'war_conflict',label:'War/Conflict'},{key:'unit',label:'Unit'}],
    formFields: [{key:'service_member',label:'Service Member',type:'text'},{key:'branch',label:'Branch',type:'text'},{key:'rank_val',label:'Rank',type:'text'},{key:'service_start',label:'Service Start',type:'date'},{key:'service_end',label:'Service End',type:'date'},{key:'war_conflict',label:'War/Conflict',type:'text'},{key:'unit',label:'Unit',type:'text'},{key:'decorations',label:'Decorations',type:'textarea'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'newspaper-archives',
    table: 'newspaper_archives',
    name: 'Newspaper Archives',
    aiFeature: 'newspaper-search',
    columns: [{key:'title',label:'Title'},{key:'newspaper_name',label:'Newspaper'},{key:'publish_date',label:'Date'},{key:'location',label:'Location'},{key:'category',label:'Category'}],
    formFields: [{key:'title',label:'Title',type:'text'},{key:'newspaper_name',label:'Newspaper Name',type:'text'},{key:'publish_date',label:'Publish Date',type:'date'},{key:'location',label:'Location',type:'text'},{key:'category',label:'Category',type:'text'},{key:'content',label:'Content',type:'textarea'},{key:'url',label:'URL',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'land-records',
    table: 'land_records',
    name: 'Land & Property Records',
    aiFeature: 'land-analysis',
    columns: [{key:'owner_name',label:'Owner'},{key:'location',label:'Location'},{key:'deed_date',label:'Deed Date'},{key:'acreage',label:'Acreage'},{key:'transaction_type',label:'Type'}],
    formFields: [{key:'owner_name',label:'Owner Name',type:'text'},{key:'property_desc',label:'Property Description',type:'textarea'},{key:'location',label:'Location',type:'text'},{key:'county',label:'County',type:'text'},{key:'state',label:'State',type:'text'},{key:'deed_date',label:'Deed Date',type:'date'},{key:'acreage',label:'Acreage',type:'number'},{key:'transaction_type',label:'Transaction Type',type:'text'},{key:'price',label:'Price',type:'number'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'church-records',
    table: 'church_records',
    name: 'Church Records',
    aiFeature: 'church-analysis',
    columns: [{key:'person_name',label:'Person'},{key:'church_name',label:'Church'},{key:'denomination',label:'Denomination'},{key:'record_type',label:'Type'},{key:'event_date',label:'Date'}],
    formFields: [{key:'person_name',label:'Person Name',type:'text'},{key:'church_name',label:'Church Name',type:'text'},{key:'denomination',label:'Denomination',type:'text'},{key:'record_type',label:'Record Type',type:'text'},{key:'event_date',label:'Event Date',type:'date'},{key:'location',label:'Location',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'ship-manifests',
    table: 'ship_manifests',
    name: 'Ship Manifests',
    aiFeature: 'ship-manifest-analysis',
    columns: [{key:'ship_name',label:'Ship'},{key:'passenger_name',label:'Passenger'},{key:'departure_port',label:'From'},{key:'arrival_port',label:'To'},{key:'arrival_date',label:'Arrival'}],
    formFields: [{key:'ship_name',label:'Ship Name',type:'text'},{key:'departure_port',label:'Departure Port',type:'text'},{key:'arrival_port',label:'Arrival Port',type:'text'},{key:'departure_date',label:'Departure Date',type:'date'},{key:'arrival_date',label:'Arrival Date',type:'date'},{key:'passenger_name',label:'Passenger Name',type:'text'},{key:'age',label:'Age',type:'number'},{key:'nationality',label:'Nationality',type:'text'},{key:'occupation',label:'Occupation',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'documents',
    table: 'documents',
    name: 'Documents',
    columns: [{key:'title',label:'Title'},{key:'doc_type',label:'Type'},{key:'person_name',label:'Person'},{key:'date_created',label:'Date'}],
    formFields: [{key:'title',label:'Title',type:'text'},{key:'doc_type',label:'Document Type',type:'text'},{key:'description',label:'Description',type:'textarea'},{key:'file_path',label:'File Path',type:'text'},{key:'person_name',label:'Person Name',type:'text'},{key:'date_created',label:'Date Created',type:'date'},{key:'notes',label:'Notes',type:'textarea'}]
  },
  {
    path: 'research-notes',
    table: 'research_notes',
    name: 'Research Notes',
    columns: [{key:'title',label:'Title'},{key:'category',label:'Category'},{key:'source',label:'Source'},{key:'person_name',label:'Person'}],
    formFields: [{key:'title',label:'Title',type:'text'},{key:'category',label:'Category',type:'text'},{key:'content',label:'Content',type:'textarea'},{key:'source',label:'Source',type:'text'},{key:'person_name',label:'Person Name',type:'text'}]
  },
  {
    path: 'source-citations',
    table: 'source_citations',
    name: 'Source Citations',
    columns: [{key:'title',label:'Title'},{key:'source_type',label:'Type'},{key:'author',label:'Author'},{key:'publication',label:'Publication'}],
    formFields: [{key:'title',label:'Title',type:'text'},{key:'source_type',label:'Source Type',type:'text'},{key:'author',label:'Author',type:'text'},{key:'publication',label:'Publication',type:'text'},{key:'date_published',label:'Date Published',type:'date'},{key:'url',label:'URL',type:'text'},{key:'repository',label:'Repository',type:'text'},{key:'notes',label:'Notes',type:'textarea'}]
  }
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {features.map((f) => (
          <Route
            key={f.path}
            path={`/${f.path}`}
            element={
              <FeaturePage
                tableName={f.table}
                displayName={f.name}
                columns={f.columns}
                formFields={f.formFields}
                aiFeature={f.aiFeature}
              />
            }
          />
        ))}

        <Route path="/ethnicity-estimation" element={<AIOnlyPage feature="ethnicity-estimation" />} />
        <Route path="/name-origin" element={<AIOnlyPage feature="name-origin" />} />
        <Route path="/timeline-generator" element={<AIOnlyPage feature="timeline-generator" />} />
      </Routes>
    </Router>
  );
}

export default App;
