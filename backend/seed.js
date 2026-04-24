const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { pool, initDB } = require('./db');

async function seed() {
  try {
    await initDB();
    console.log('Seeding database...');

    // Create default user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@genealogy.com', hashedPassword, 'Admin User']
    );
    console.log('Default user created (admin@genealogy.com / password123)');

    // Seed persons
    const persons = [
      ['John', 'Sullivan', '1842-03-15', '1918-11-02', 'County Cork, Ireland', 'Boston, Massachusetts', 'male', 'Immigrated to the US in 1862 during the Civil War era.'],
      ['Mary', 'O\'Brien', '1845-08-22', '1920-04-10', 'County Kerry, Ireland', 'Boston, Massachusetts', 'female', 'Married John Sullivan in 1866.'],
      ['Thomas', 'Sullivan', '1867-01-10', '1940-06-18', 'Boston, Massachusetts', 'Worcester, Massachusetts', 'male', 'Eldest son of John and Mary Sullivan.'],
      ['Margaret', 'Walsh', '1870-05-03', '1945-12-25', 'Lowell, Massachusetts', 'Worcester, Massachusetts', 'female', 'Married Thomas Sullivan in 1890.'],
      ['James', 'Sullivan', '1891-09-14', '1968-03-22', 'Worcester, Massachusetts', 'Springfield, Massachusetts', 'male', 'Served in World War I. Worked as a machinist.'],
      ['Anna', 'Kowalski', '1895-02-28', '1972-08-15', 'Krakow, Poland', 'Springfield, Massachusetts', 'female', 'Immigrated from Poland in 1910.'],
      ['William', 'Sullivan', '1920-07-04', '1998-01-30', 'Springfield, Massachusetts', 'Hartford, Connecticut', 'male', 'WWII veteran. Purple Heart recipient.'],
      ['Helen', 'Petrov', '1922-11-11', '2005-09-18', 'New York, New York', 'Hartford, Connecticut', 'female', 'Daughter of Russian immigrants.'],
      ['Robert', 'Sullivan', '1948-03-20', null, 'Hartford, Connecticut', null, 'male', 'Vietnam War veteran. Retired teacher.'],
      ['Catherine', 'Murphy', '1950-06-15', null, 'Dublin, Ireland', null, 'female', 'Immigrated to the US in 1970.'],
      ['Patrick', 'Sullivan', '1975-10-08', null, 'Hartford, Connecticut', null, 'male', 'Software engineer. Amateur genealogist.'],
      ['Elizabeth', 'Chen', '1978-04-22', null, 'San Francisco, California', null, 'female', 'Third-generation Chinese American.'],
      ['Michael', 'Sullivan', '2005-12-01', null, 'Boston, Massachusetts', null, 'male', 'Current family historian.'],
      ['Sarah', 'Sullivan', '2008-03-15', null, 'Boston, Massachusetts', null, 'female', 'Interested in DNA genealogy.'],
      ['Heinrich', 'Mueller', '1835-06-20', '1901-02-14', 'Bavaria, Germany', 'Milwaukee, Wisconsin', 'male', 'Brewer who emigrated during the 1848 revolutions.'],
    ];
    for (const p of persons) {
      await pool.query(
        `INSERT INTO persons (first_name, last_name, birth_date, death_date, birth_place, death_place, gender, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        p
      );
    }
    console.log(`Seeded ${persons.length} persons`);

    // Seed family_trees
    const trees = [
      ['Sullivan Family Tree', 'Main family tree tracing the Sullivan line from County Cork, Ireland to present-day New England.'],
      ['O\'Brien-Sullivan Connection', 'Connection between the O\'Brien family of County Kerry and the Sullivan family.'],
      ['Kowalski Immigration Line', 'Polish branch of the family through Anna Kowalski.'],
      ['Petrov Russian Heritage', 'Russian immigrant branch through Helen Petrov.'],
      ['Mueller German Line', 'German branch tracing back to Bavaria.'],
      ['Chen Family Heritage', 'Chinese American branch through Elizabeth Chen.'],
      ['Murphy Irish Connection', 'Modern Irish connection through Catherine Murphy.'],
      ['Sullivan Military Service', 'Family tree focused on military service across generations.'],
      ['New England Sullivans', 'All Sullivan family members who settled in New England.'],
      ['Immigrant Ancestors', 'Combined tree of all immigrant ancestors across family lines.'],
      ['Walsh-Sullivan Marriage Line', 'Connection through Margaret Walsh and Thomas Sullivan.'],
      ['20th Century Descendants', 'All descendants born in the 20th century.'],
      ['Irish Roots', 'Combined Irish heritage from both Sullivan and Murphy lines.'],
      ['Eastern European Branch', 'Polish and Russian branches of the family.'],
      ['Complete Sullivan Heritage', 'Comprehensive tree including all known branches and connections.'],
    ];
    for (const t of trees) {
      await pool.query(
        'INSERT INTO family_trees (name, description) VALUES ($1, $2)',
        t
      );
    }
    console.log(`Seeded ${trees.length} family_trees`);

    // Seed historical_records
    const historicalRecords = [
      ['Sullivan Land Grant', 'land_grant', '1865-04-10', 'Worcester, Massachusetts', 'Land grant of 40 acres to John Sullivan after Civil War service.', 'Worcester County Registry of Deeds', 'John Sullivan'],
      ['O\'Brien Baptismal Record', 'baptism', '1845-08-30', 'County Kerry, Ireland', 'Baptismal record of Mary O\'Brien at St. Mary\'s Church.', 'Kerry Diocese Archives', 'Mary O\'Brien'],
      ['Sullivan Marriage Certificate', 'marriage', '1866-06-15', 'Boston, Massachusetts', 'Marriage of John Sullivan and Mary O\'Brien at Holy Cross Cathedral.', 'Boston City Hall Records', 'John Sullivan'],
      ['1870 Census Entry', 'census', '1870-06-01', 'Boston, Massachusetts', 'John Sullivan household in Ward 7, Boston.', 'National Archives', 'John Sullivan'],
      ['Thomas Sullivan Birth Record', 'birth', '1867-01-10', 'Boston, Massachusetts', 'Birth certificate of Thomas Sullivan, son of John and Mary.', 'Massachusetts Vital Records', 'Thomas Sullivan'],
      ['Sullivan Naturalization Papers', 'naturalization', '1868-03-20', 'Boston, Massachusetts', 'Naturalization certificate for John Sullivan, originally of Ireland.', 'National Archives', 'John Sullivan'],
      ['WWI Draft Registration', 'military', '1917-06-05', 'Worcester, Massachusetts', 'James Sullivan draft registration card for World War I.', 'National Archives', 'James Sullivan'],
      ['Kowalski Ship Manifest', 'immigration', '1910-05-15', 'Ellis Island, New York', 'Anna Kowalski arrival on SS Kaiser Wilhelm der Grosse.', 'Ellis Island Foundation', 'Anna Kowalski'],
      ['Sullivan Obituary', 'obituary', '1918-11-05', 'Boston, Massachusetts', 'Obituary of John Sullivan in the Boston Globe.', 'Boston Globe Archives', 'John Sullivan'],
      ['WWII Service Record', 'military', '1942-12-07', 'Hartford, Connecticut', 'William Sullivan enlistment record, US Army.', 'National Personnel Records Center', 'William Sullivan'],
      ['Purple Heart Citation', 'military', '1944-06-06', 'Normandy, France', 'Purple Heart award to Pvt. William Sullivan during D-Day operations.', 'US Army Records', 'William Sullivan'],
      ['Mueller Brewery License', 'business', '1870-03-01', 'Milwaukee, Wisconsin', 'Brewery operating license for Heinrich Mueller.', 'Milwaukee County Records', 'Heinrich Mueller'],
      ['Petrov Ellis Island Record', 'immigration', '1905-09-12', 'Ellis Island, New York', 'Arrival record of the Petrov family from Odessa, Russia.', 'Ellis Island Foundation', 'Ivan Petrov'],
      ['Sullivan Family Bible Entry', 'family_record', '1867-01-10', 'Boston, Massachusetts', 'Family Bible recording births, marriages, and deaths.', 'Sullivan Family Collection', 'Sullivan Family'],
      ['Murphy Passport Application', 'immigration', '1970-01-15', 'Dublin, Ireland', 'Passport application for Catherine Murphy emigrating to the US.', 'Irish National Archives', 'Catherine Murphy'],
    ];
    for (const r of historicalRecords) {
      await pool.query(
        `INSERT INTO historical_records (title, record_type, date, location, description, source, person_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        r
      );
    }
    console.log(`Seeded ${historicalRecords.length} historical_records`);

    // Seed dna_matches
    const dnaMatches = [
      ['Sean O\'Sullivan', '2nd Cousin', 92.5, 230, 12, 'AncestryDNA', 'Likely shares great-grandparents from County Cork.'],
      ['Bridget Callahan', '3rd Cousin', 85.0, 78, 5, 'AncestryDNA', 'Possible connection through the O\'Brien line.'],
      ['Marek Kowalski', '2nd Cousin Once Removed', 88.0, 150, 8, '23andMe', 'Polish connection through Anna Kowalski branch.'],
      ['Dmitri Petrov', '3rd Cousin', 80.0, 65, 4, '23andMe', 'Russian heritage match through Helen Petrov line.'],
      ['Siobhan Murphy', '1st Cousin Once Removed', 95.0, 450, 22, 'AncestryDNA', 'Close match on the Murphy Irish line.'],
      ['Hans Mueller', '3rd Cousin', 78.0, 55, 3, 'MyHeritage', 'German connection through Heinrich Mueller.'],
      ['Liam O\'Brien', '4th Cousin', 70.0, 35, 2, 'AncestryDNA', 'Distant match, possible County Kerry connection.'],
      ['Katarzyna Nowak', '3rd Cousin Once Removed', 75.0, 45, 3, '23andMe', 'Another Polish match near Krakow region.'],
      ['Giovanni Russo', 'Unknown', 60.0, 20, 1, 'AncestryDNA', 'Unexpected Italian match. Investigate further.'],
      ['Emily Watson', '4th Cousin', 72.0, 30, 2, 'MyHeritage', 'English connection, possibly through maternal line.'],
      ['Chen Wei', '2nd Cousin', 91.0, 210, 11, '23andMe', 'Connection through Elizabeth Chen\'s family.'],
      ['Pierre Dubois', '5th Cousin', 55.0, 15, 1, 'AncestryDNA', 'Very distant French match. Norman ancestry?'],
      ['Aoife Sullivan', '2nd Cousin', 90.0, 200, 10, 'AncestryDNA', 'Strong Sullivan match from Ireland.'],
      ['Yuki Tanaka', 'Unknown', 50.0, 12, 1, 'MyHeritage', 'Unexpected match. Possible misattribution.'],
      ['Rosa Martinez', '4th Cousin', 68.0, 28, 2, 'AncestryDNA', 'Spanish match. Possible Iberian ancestry.'],
    ];
    for (const d of dnaMatches) {
      await pool.query(
        `INSERT INTO dna_matches (match_name, relationship, confidence_pct, shared_cm, shared_segments, platform, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        d
      );
    }
    console.log(`Seeded ${dnaMatches.length} dna_matches`);

    // Seed census_records
    const censusRecords = [
      [1870, 'Massachusetts', 'Suffolk', 'Boston', 'John Sullivan', 3, 'Laborer', '42 Hanover Street', 'First census after immigration.'],
      [1880, 'Massachusetts', 'Suffolk', 'Boston', 'John Sullivan', 5, 'Dockworker', '78 Atlantic Avenue', 'Family growing, includes Thomas and two daughters.'],
      [1890, 'Massachusetts', 'Worcester', 'Worcester', 'Thomas Sullivan', 2, 'Factory Worker', '15 Main Street', 'Thomas newly married to Margaret Walsh.'],
      [1900, 'Massachusetts', 'Worcester', 'Worcester', 'Thomas Sullivan', 5, 'Foreman', '23 Elm Street', 'Three children including James.'],
      [1910, 'Massachusetts', 'Worcester', 'Worcester', 'Thomas Sullivan', 6, 'Foreman', '23 Elm Street', 'Full household with aging parents.'],
      [1920, 'Massachusetts', 'Hampden', 'Springfield', 'James Sullivan', 3, 'Machinist', '110 State Street', 'Post-WWI, married to Anna Kowalski.'],
      [1930, 'Massachusetts', 'Hampden', 'Springfield', 'James Sullivan', 5, 'Machinist', '245 Maple Street', 'Including William born 1920.'],
      [1940, 'Connecticut', 'Hartford', 'Hartford', 'William Sullivan', 2, 'Clerk', '88 Park Street', 'Just before WWII service.'],
      [1950, 'Connecticut', 'Hartford', 'Hartford', 'William Sullivan', 4, 'Insurance Agent', '156 Prospect Avenue', 'Post-war family with Robert.'],
      [1960, 'Connecticut', 'Hartford', 'Hartford', 'William Sullivan', 4, 'Insurance Manager', '156 Prospect Avenue', 'Stable household.'],
      [1870, 'Wisconsin', 'Milwaukee', 'Milwaukee', 'Heinrich Mueller', 4, 'Brewer', '320 German Street', 'Mueller family in German neighborhood.'],
      [1880, 'Wisconsin', 'Milwaukee', 'Milwaukee', 'Heinrich Mueller', 6, 'Master Brewer', '450 Beer Street', 'Expanded brewery business.'],
      [1900, 'New York', 'New York', 'New York', 'Ivan Petrov', 5, 'Tailor', '22 Orchard Street', 'Petrov family on Lower East Side.'],
      [1910, 'New York', 'New York', 'New York', 'Ivan Petrov', 6, 'Tailor', '35 Hester Street', 'Including Helen born 1922 is wrong—check records.'],
      [1970, 'Connecticut', 'Hartford', 'Hartford', 'Robert Sullivan', 3, 'Teacher', '42 Oak Lane', 'Robert married to Catherine Murphy.'],
    ];
    for (const c of censusRecords) {
      await pool.query(
        `INSERT INTO census_records (year, state, county, city, head_of_household, members, occupation, address, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        c
      );
    }
    console.log(`Seeded ${censusRecords.length} census_records`);

    // Seed immigration_records
    const immigrationRecords = [
      ['John Sullivan', 'Ireland', 'Boston, Massachusetts', '1862-08-20', 'SS City of Washington', 'Boston', 20, 'Laborer', 'Fled famine aftermath. Traveled steerage.'],
      ['Mary O\'Brien', 'Ireland', 'Boston, Massachusetts', '1864-03-12', 'SS Cunard Line', 'Boston', 19, 'Domestic Servant', 'Traveled with cousin Brigid.'],
      ['Anna Kowalski', 'Poland', 'New York, New York', '1910-05-15', 'SS Kaiser Wilhelm der Grosse', 'Ellis Island', 15, 'None', 'Traveled with uncle. Processed at Ellis Island.'],
      ['Ivan Petrov', 'Russia', 'New York, New York', '1905-09-12', 'SS Rotterdam', 'Ellis Island', 30, 'Tailor', 'Fleeing pogroms in Odessa.'],
      ['Heinrich Mueller', 'Germany', 'New York, New York', '1855-10-01', 'SS Hermann', 'Castle Garden', 20, 'Brewer', 'Emigrated after 1848 revolution. Went to Milwaukee.'],
      ['Catherine Murphy', 'Ireland', 'New York, New York', '1970-03-22', 'Aer Lingus Flight', 'JFK Airport', 20, 'Secretary', 'Modern immigration via air travel.'],
      ['Chen Mingzhu', 'China', 'San Francisco, California', '1920-06-10', 'SS China', 'Angel Island', 25, 'Merchant', 'Elizabeth Chen\'s grandfather. Detained 3 weeks.'],
      ['Brigid O\'Brien', 'Ireland', 'Boston, Massachusetts', '1864-03-12', 'SS Cunard Line', 'Boston', 22, 'Seamstress', 'Traveled with Mary O\'Brien.'],
      ['Stefan Kowalski', 'Poland', 'New York, New York', '1905-04-20', 'SS Rhein', 'Ellis Island', 35, 'Blacksmith', 'Anna Kowalski\'s uncle.'],
      ['Olga Petrov', 'Russia', 'New York, New York', '1905-09-12', 'SS Rotterdam', 'Ellis Island', 28, 'None', 'Ivan Petrov\'s wife.'],
      ['Friedrich Mueller', 'Germany', 'New York, New York', '1855-10-01', 'SS Hermann', 'Castle Garden', 18, 'Apprentice', 'Heinrich\'s brother.'],
      ['Patrick Sullivan', 'Ireland', 'Boston, Massachusetts', '1860-05-10', 'SS Great Eastern', 'Boston', 25, 'Farmer', 'John Sullivan\'s older brother.'],
      ['Rosa Kowalski', 'Poland', 'New York, New York', '1912-08-03', 'SS Imperator', 'Ellis Island', 20, 'None', 'Anna\'s sister. Arrived two years later.'],
      ['Nadia Petrov', 'Russia', 'New York, New York', '1907-11-25', 'SS Mauretania', 'Ellis Island', 18, 'None', 'Ivan\'s niece.'],
      ['Chen Liwei', 'China', 'San Francisco, California', '1925-02-14', 'SS President Taft', 'Angel Island', 22, 'Cook', 'Mingzhu\'s cousin. Also detained.'],
    ];
    for (const i of immigrationRecords) {
      await pool.query(
        `INSERT INTO immigration_records (immigrant_name, origin_country, destination, arrival_date, ship_name, port_of_arrival, age_at_arrival, occupation, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        i
      );
    }
    console.log(`Seeded ${immigrationRecords.length} immigration_records`);

    // Seed birth_death_records
    const birthDeathRecords = [
      ['John Sullivan', 'birth', '1842-03-15', 'Bantry', 'Cork', 'County Cork', null, 'Born in parish of Bantry.'],
      ['John Sullivan', 'death', '1918-11-02', 'Boston', 'Suffolk', 'Massachusetts', 'MA-1918-45021', 'Died of influenza during 1918 pandemic.'],
      ['Mary O\'Brien', 'birth', '1845-08-22', 'Killarney', 'Kerry', 'County Kerry', null, 'Church baptismal record.'],
      ['Mary O\'Brien', 'death', '1920-04-10', 'Boston', 'Suffolk', 'Massachusetts', 'MA-1920-12003', 'Died of heart failure.'],
      ['Thomas Sullivan', 'birth', '1867-01-10', 'Boston', 'Suffolk', 'Massachusetts', 'MA-1867-00342', 'First American-born Sullivan.'],
      ['Thomas Sullivan', 'death', '1940-06-18', 'Worcester', 'Worcester', 'Massachusetts', 'MA-1940-28901', 'Died of pneumonia.'],
      ['James Sullivan', 'birth', '1891-09-14', 'Worcester', 'Worcester', 'Massachusetts', 'MA-1891-15678', 'Born at home. Midwife delivery.'],
      ['James Sullivan', 'death', '1968-03-22', 'Springfield', 'Hampden', 'Massachusetts', 'MA-1968-09234', 'Died of lung cancer.'],
      ['William Sullivan', 'birth', '1920-07-04', 'Springfield', 'Hampden', 'Massachusetts', 'MA-1920-34567', 'Born on Independence Day.'],
      ['William Sullivan', 'death', '1998-01-30', 'Hartford', 'Hartford', 'Connecticut', 'CT-1998-02345', 'Died of natural causes at age 77.'],
      ['Helen Petrov', 'birth', '1922-11-11', 'New York', 'New York', 'New York', 'NY-1922-89012', 'Born on Armistice Day.'],
      ['Helen Petrov', 'death', '2005-09-18', 'Hartford', 'Hartford', 'Connecticut', 'CT-2005-14567', 'Died peacefully at age 82.'],
      ['Heinrich Mueller', 'birth', '1835-06-20', 'Munich', null, 'Bavaria', null, 'German parish record.'],
      ['Heinrich Mueller', 'death', '1901-02-14', 'Milwaukee', 'Milwaukee', 'Wisconsin', 'WI-1901-03456', 'Died of liver disease.'],
      ['Robert Sullivan', 'birth', '1948-03-20', 'Hartford', 'Hartford', 'Connecticut', 'CT-1948-07890', 'Born at Hartford Hospital.'],
    ];
    for (const b of birthDeathRecords) {
      await pool.query(
        `INSERT INTO birth_death_records (person_name, record_type, event_date, location, county, state, certificate_number, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        b
      );
    }
    console.log(`Seeded ${birthDeathRecords.length} birth_death_records`);

    // Seed marriage_records
    const marriageRecords = [
      ['John Sullivan', 'Mary O\'Brien', '1866-06-15', 'Boston', 'Suffolk', 'Massachusetts', 'Father Patrick Hennessy', 'Michael Sullivan, Brigid O\'Brien', 'MA-M-1866-2345', 'Catholic ceremony at Holy Cross Cathedral.'],
      ['Thomas Sullivan', 'Margaret Walsh', '1890-10-20', 'Worcester', 'Worcester', 'Massachusetts', 'Father James Dolan', 'John Sullivan, Elizabeth Walsh', 'MA-M-1890-5678', 'Married at St. Paul\'s Church.'],
      ['James Sullivan', 'Anna Kowalski', '1919-04-05', 'Springfield', 'Hampden', 'Massachusetts', 'Father Michael O\'Connell', 'William Murphy, Rosa Kowalski', 'MA-M-1919-1234', 'Post-war wedding. Small ceremony.'],
      ['William Sullivan', 'Helen Petrov', '1945-12-20', 'Hartford', 'Hartford', 'Connecticut', 'Rev. Thomas Andrews', 'Robert Petrov, James Sullivan Jr.', 'CT-M-1945-6789', 'Post-WWII wedding. Ecumenical ceremony.'],
      ['Robert Sullivan', 'Catherine Murphy', '1972-06-10', 'Hartford', 'Hartford', 'Connecticut', 'Father Sean O\'Malley', 'Patrick Murphy, William Sullivan', 'CT-M-1972-3456', 'Large Irish-American wedding.'],
      ['Patrick Sullivan', 'Elizabeth Chen', '2002-09-14', 'Boston', 'Suffolk', 'Massachusetts', 'Justice Maria Lopez', 'Michael Chen, Robert Sullivan', 'MA-M-2002-7890', 'Civil ceremony at Boston City Hall.'],
      ['Heinrich Mueller', 'Greta Hoffmann', '1858-05-01', 'Milwaukee', 'Milwaukee', 'Wisconsin', 'Pastor Wilhelm Schmidt', 'Friedrich Mueller, Karl Hoffmann', 'WI-M-1858-0123', 'Lutheran ceremony. German language.'],
      ['Ivan Petrov', 'Olga Sokolova', '1903-03-15', 'Odessa', null, 'Russia', 'Rabbi David Levin', 'Mikhail Petrov, Anna Sokolova', null, 'Married in Russia before emigration.'],
      ['Stefan Kowalski', 'Jadwiga Nowak', '1900-08-12', 'Krakow', null, 'Poland', 'Father Andrzej Wozniak', 'Jan Kowalski, Maria Nowak', null, 'Catholic ceremony in Krakow.'],
      ['Chen Mingzhu', 'Lin Mei', '1918-01-20', 'Guangzhou', null, 'China', 'Village Elder Chen Bo', 'Chen Daming, Lin Hua', null, 'Traditional Chinese ceremony.'],
      ['Patrick Sullivan Sr.', 'Eileen Brennan', '1855-02-14', 'Cork', 'Cork', 'Ireland', 'Father Liam Casey', 'Sean Sullivan, Mary Brennan', null, 'Valentine\'s Day wedding in Cork.'],
      ['Michael Sullivan', 'Bridget Callahan', '1830-07-22', 'Cork', 'Cork', 'Ireland', 'Father Brendan Walsh', 'Daniel Sullivan, Rose Callahan', null, 'John Sullivan\'s parents\' marriage.'],
      ['Friedrich Mueller', 'Anna Braun', '1860-09-10', 'Milwaukee', 'Milwaukee', 'Wisconsin', 'Pastor Wilhelm Schmidt', 'Heinrich Mueller, Otto Braun', 'WI-M-1860-0456', 'Heinrich\'s brother\'s wedding.'],
      ['Chen Liwei', 'Zhang Hua', '1928-11-05', 'San Francisco', 'San Francisco', 'California', 'Justice William Tong', 'Chen Mingzhu, Zhang Wei', 'CA-M-1928-2345', 'Ceremony in Chinatown.'],
      ['Dmitri Petrov', 'Natasha Volkov', '1930-06-18', 'New York', 'New York', 'New York', 'Rev. Alexander Popov', 'Ivan Petrov, Boris Volkov', 'NY-M-1930-5678', 'Russian Orthodox ceremony.'],
    ];
    for (const m of marriageRecords) {
      await pool.query(
        `INSERT INTO marriage_records (spouse1_name, spouse2_name, marriage_date, location, county, state, officiant, witnesses, certificate_number, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        m
      );
    }
    console.log(`Seeded ${marriageRecords.length} marriage_records`);

    // Seed military_records
    const militaryRecords = [
      ['John Sullivan', 'US Army', 'Private', '1862-09-01', '1865-04-15', 'American Civil War', '28th Massachusetts Infantry', 'None recorded', 'Served with the Irish Brigade. Wounded at Fredericksburg.'],
      ['James Sullivan', 'US Army', 'Corporal', '1917-06-15', '1919-02-20', 'World War I', '26th "Yankee" Division', 'None recorded', 'Served in France. Experienced trench warfare.'],
      ['William Sullivan', 'US Army', 'Private First Class', '1942-12-15', '1945-09-30', 'World War II', '1st Infantry Division', 'Purple Heart, Bronze Star', 'Wounded during D-Day at Omaha Beach. Fought through France and Germany.'],
      ['Robert Sullivan', 'US Army', 'Sergeant', '1968-06-01', '1970-08-15', 'Vietnam War', '25th Infantry Division', 'Army Commendation Medal', 'Served two tours in Vietnam. Drafted in 1968.'],
      ['Patrick Sullivan Sr.', 'British Army', 'Private', '1854-03-01', '1856-06-30', 'Crimean War', '88th Regiment of Foot', 'None recorded', 'Served before emigrating to America.'],
      ['Heinrich Mueller', 'Bavarian Army', 'Corporal', '1848-03-15', '1849-08-20', 'Revolutions of 1848', 'Bavarian Militia', 'None recorded', 'Fought in the March Revolution. Emigrated afterward.'],
      ['Ivan Petrov', 'Russian Imperial Army', 'Private', '1895-01-10', '1897-12-31', 'Peacetime Service', '15th Infantry Regiment', 'None recorded', 'Mandatory military service before emigration.'],
      ['Thomas Sullivan', 'None', 'None', null, null, 'Spanish-American War', 'None', 'None', 'Attempted to enlist but rejected for flat feet.'],
      ['Michael Sullivan', 'US Navy', 'Able Seaman', '1860-04-12', '1865-04-15', 'American Civil War', 'USS Hartford', 'None recorded', 'John Sullivan\'s father served in the Navy.'],
      ['Friedrich Mueller', 'US Army', 'Private', '1861-08-01', '1865-05-01', 'American Civil War', '26th Wisconsin Infantry', 'None recorded', 'German immigrant regiment. Fought at Gettysburg.'],
      ['Chen Mingzhu', 'US Army', 'Private', '1942-02-01', '1945-08-15', 'World War II', '442nd Regimental Combat Team', 'None recorded', 'Served in the Pacific Theater.'],
      ['Dmitri Petrov', 'US Army', 'Corporal', '1942-01-15', '1945-09-02', 'World War II', '82nd Airborne Division', 'Silver Star', 'Parachuted into Normandy on D-Day.'],
      ['Patrick Sullivan', 'US Marine Corps', 'Lance Corporal', '1993-06-01', '1997-05-31', 'Peacetime Service', '2nd Marine Division', 'Good Conduct Medal', 'Peacetime service. Stationed at Camp Lejeune.'],
      ['Stefan Kowalski', 'Austro-Hungarian Army', 'Private', '1890-01-01', '1892-12-31', 'Peacetime Service', 'Galician Infantry Regiment', 'None', 'Mandatory service before emigration.'],
      ['Sean O\'Sullivan', 'Irish Defence Forces', 'Private', '1940-05-01', '1945-09-01', 'World War II (Emergency)', 'Irish Army Reserve', 'None', 'Ireland was neutral but maintained defense forces.'],
    ];
    for (const m of militaryRecords) {
      await pool.query(
        `INSERT INTO military_records (service_member, branch, rank_val, service_start, service_end, war_conflict, unit, decorations, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        m
      );
    }
    console.log(`Seeded ${militaryRecords.length} military_records`);

    // Seed newspaper_archives
    const newspaperArchives = [
      ['Sullivan-O\'Brien Wedding Announcement', 'Boston Pilot', '1866-06-20', 'Boston, Massachusetts', 'wedding', 'Mr. John Sullivan of County Cork and Miss Mary O\'Brien of County Kerry were united in holy matrimony at Holy Cross Cathedral on Saturday last.', null, 'Irish-American newspaper.'],
      ['John Sullivan Obituary', 'Boston Globe', '1918-11-05', 'Boston, Massachusetts', 'obituary', 'John Sullivan, aged 76, beloved husband of Mary, died November 2 of influenza. A veteran of the Civil War and longtime dockworker. Survived by three children.', null, 'Flu pandemic death notice.'],
      ['Sullivan Boy Enlists', 'Worcester Telegram', '1917-06-20', 'Worcester, Massachusetts', 'news', 'James Sullivan, 25, of Elm Street has enlisted for service in the Great War, joining many Worcester boys answering the call.', null, 'WWI enlistment notice.'],
      ['Mueller Brewery Opens', 'Milwaukee Sentinel', '1870-03-15', 'Milwaukee, Wisconsin', 'business', 'Mr. Heinrich Mueller, late of Bavaria, has opened a fine brewery on Beer Street, producing lagers of the highest quality.', null, 'German-language section.'],
      ['Kowalski Arrives at Ellis Island', 'New York Tribune', '1910-05-16', 'New York, New York', 'immigration', 'Among yesterday\'s arrivals at Ellis Island were passengers from the SS Kaiser Wilhelm, including families from Poland and Germany.', null, 'Immigration news column.'],
      ['Sullivan Receives Purple Heart', 'Hartford Courant', '1945-01-15', 'Hartford, Connecticut', 'military', 'PFC William Sullivan of Hartford has been awarded the Purple Heart for wounds sustained during the Normandy invasion.', null, 'WWII service recognition.'],
      ['Sullivan-Petrov Wedding', 'Hartford Courant', '1945-12-22', 'Hartford, Connecticut', 'wedding', 'William Sullivan and Helen Petrov were married Saturday at First Congregational Church in a ceremony attended by family and friends.', null, 'Post-war wedding announcement.'],
      ['Vietnam Veteran Returns', 'Hartford Courant', '1970-08-20', 'Hartford, Connecticut', 'news', 'Sgt. Robert Sullivan has returned home after serving two tours of duty in Vietnam with the 25th Infantry Division.', null, 'Vietnam era coverage.'],
      ['Mueller Brewery Expansion', 'Milwaukee Sentinel', '1880-07-10', 'Milwaukee, Wisconsin', 'business', 'The Mueller Brewery has expanded operations, now employing 20 men and producing 500 barrels per annum.', null, 'Business section coverage.'],
      ['Heinrich Mueller Obituary', 'Milwaukee Sentinel', '1901-02-16', 'Milwaukee, Wisconsin', 'obituary', 'Heinrich Mueller, 65, master brewer and respected citizen, died Thursday. Born in Bavaria, he built one of Milwaukee\'s finest small breweries.', null, 'Prominent German-American death.'],
      ['Chinese Exclusion Protest', 'San Francisco Chronicle', '1920-07-01', 'San Francisco, California', 'news', 'Local Chinese merchants including Chen Mingzhu protested continued enforcement of exclusion policies at Angel Island.', null, 'Civil rights coverage.'],
      ['Sullivan Family Reunion', 'Boston Globe', '1960-07-04', 'Boston, Massachusetts', 'social', 'The Sullivan family held their annual reunion at Franklin Park on Independence Day, with over 50 family members attending.', null, 'Social page announcement.'],
      ['Mary O\'Brien Sullivan Obituary', 'Boston Globe', '1920-04-12', 'Boston, Massachusetts', 'obituary', 'Mary Sullivan (nee O\'Brien), 74, wife of the late John Sullivan, passed peacefully at home. A pillar of the Irish community.', null, 'Death notice.'],
      ['Robert Sullivan Named Teacher of Year', 'Hartford Courant', '1985-05-15', 'Hartford, Connecticut', 'education', 'Robert Sullivan of Hartford High School has been named Teacher of the Year for his dedication to American History education.', null, 'Education section.'],
      ['Sullivan-Chen Wedding', 'Boston Globe', '2002-09-16', 'Boston, Massachusetts', 'wedding', 'Patrick Sullivan and Elizabeth Chen were married in a civil ceremony at Boston City Hall on September 14.', null, 'Modern wedding announcement.'],
    ];
    for (const n of newspaperArchives) {
      await pool.query(
        `INSERT INTO newspaper_archives (title, newspaper_name, publish_date, location, category, content, url, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        n
      );
    }
    console.log(`Seeded ${newspaperArchives.length} newspaper_archives`);

    // Seed land_records
    const landRecords = [
      ['John Sullivan', 'Residential lot with dwelling house', 'Boston, Massachusetts', 'Suffolk', 'Massachusetts', '1870-05-15', 0.25, 'Purchase', 800, 'First property purchase in America.'],
      ['Thomas Sullivan', 'Two-story house with garden', 'Worcester, Massachusetts', 'Worcester', 'Massachusetts', '1892-03-10', 0.5, 'Purchase', 1500, 'Family home on Elm Street.'],
      ['Heinrich Mueller', 'Brewery and adjacent lot', 'Milwaukee, Wisconsin', 'Milwaukee', 'Wisconsin', '1868-09-01', 2.0, 'Purchase', 3000, 'Site of Mueller Brewery.'],
      ['James Sullivan', 'Residential property', 'Springfield, Massachusetts', 'Hampden', 'Massachusetts', '1920-06-01', 0.3, 'Purchase', 2500, 'Post-war home purchase.'],
      ['William Sullivan', 'Colonial-style house', 'Hartford, Connecticut', 'Hartford', 'Connecticut', '1946-03-15', 0.4, 'Purchase', 5000, 'GI Bill home purchase after WWII.'],
      ['Robert Sullivan', 'Cape Cod style home', 'Hartford, Connecticut', 'Hartford', 'Connecticut', '1973-08-20', 0.35, 'Purchase', 28000, 'First home after marriage.'],
      ['Patrick Sullivan', 'Condominium unit', 'Boston, Massachusetts', 'Suffolk', 'Massachusetts', '2003-04-01', null, 'Purchase', 250000, 'Urban condo purchase.'],
      ['John Sullivan', 'Vacant lot', 'Boston, Massachusetts', 'Suffolk', 'Massachusetts', '1865-04-10', 0.5, 'Land Grant', 0, 'Civil War veteran land grant.'],
      ['Heinrich Mueller', 'Additional brewery land', 'Milwaukee, Wisconsin', 'Milwaukee', 'Wisconsin', '1878-11-20', 1.5, 'Purchase', 2000, 'Expansion of brewery operations.'],
      ['Thomas Sullivan', 'Farm property', 'Worcester, Massachusetts', 'Worcester', 'Massachusetts', '1910-07-15', 10.0, 'Purchase', 3500, 'Small farm outside the city.'],
      ['Chen Mingzhu', 'Commercial property in Chinatown', 'San Francisco, California', 'San Francisco', 'California', '1925-08-10', 0.1, 'Purchase', 4000, 'Shop location on Grant Avenue.'],
      ['Ivan Petrov', 'Tenement building', 'New York, New York', 'New York', 'New York', '1915-02-28', 0.15, 'Purchase', 8000, 'Investment property on Lower East Side.'],
      ['William Sullivan', 'Vacation cabin', 'Old Saybrook, Connecticut', 'Middlesex', 'Connecticut', '1965-05-01', 1.0, 'Purchase', 8500, 'Summer retreat on Long Island Sound.'],
      ['Thomas Sullivan', 'Sale of Boston lot', 'Boston, Massachusetts', 'Suffolk', 'Massachusetts', '1895-01-10', 0.25, 'Sale', 1200, 'Sold inherited Boston property.'],
      ['Margaret Walsh Sullivan', 'Inherited property', 'Worcester, Massachusetts', 'Worcester', 'Massachusetts', '1940-07-01', 0.5, 'Inheritance', 0, 'Inherited family home after Thomas died.'],
    ];
    for (const l of landRecords) {
      await pool.query(
        `INSERT INTO land_records (owner_name, property_desc, location, county, state, deed_date, acreage, transaction_type, price, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        l
      );
    }
    console.log(`Seeded ${landRecords.length} land_records`);

    // Seed church_records
    const churchRecords = [
      ['John Sullivan', 'St. Finbarr\'s Church', 'Catholic', 'baptism', '1842-03-20', 'Bantry, County Cork, Ireland', 'Baptized five days after birth.'],
      ['Mary O\'Brien', 'St. Mary\'s Church', 'Catholic', 'baptism', '1845-08-30', 'Killarney, County Kerry, Ireland', 'Parish baptismal register.'],
      ['John Sullivan', 'Holy Cross Cathedral', 'Catholic', 'marriage', '1866-06-15', 'Boston, Massachusetts', 'Marriage to Mary O\'Brien.'],
      ['Thomas Sullivan', 'Holy Cross Cathedral', 'Catholic', 'baptism', '1867-01-17', 'Boston, Massachusetts', 'Baptized one week after birth.'],
      ['Thomas Sullivan', 'St. Paul\'s Church', 'Catholic', 'marriage', '1890-10-20', 'Worcester, Massachusetts', 'Marriage to Margaret Walsh.'],
      ['James Sullivan', 'St. Paul\'s Church', 'Catholic', 'baptism', '1891-09-21', 'Worcester, Massachusetts', 'Baptized by Father Dolan.'],
      ['James Sullivan', 'Our Lady of Hope', 'Catholic', 'marriage', '1919-04-05', 'Springfield, Massachusetts', 'Marriage to Anna Kowalski.'],
      ['William Sullivan', 'Our Lady of Hope', 'Catholic', 'baptism', '1920-07-11', 'Springfield, Massachusetts', 'Baptized on his parents\' first anniversary month.'],
      ['Heinrich Mueller', 'St. Peter\'s Lutheran', 'Lutheran', 'baptism', '1835-06-27', 'Munich, Bavaria, Germany', 'Lutheran baptism record.'],
      ['Heinrich Mueller', 'Zion Lutheran Church', 'Lutheran', 'marriage', '1858-05-01', 'Milwaukee, Wisconsin', 'Marriage to Greta Hoffmann.'],
      ['Ivan Petrov', 'Holy Trinity Orthodox', 'Russian Orthodox', 'baptism', '1875-04-10', 'Odessa, Russia', 'Orthodox baptism record.'],
      ['Helen Petrov', 'St. Nicholas Orthodox', 'Russian Orthodox', 'baptism', '1922-12-01', 'New York, New York', 'Baptized in Russian Orthodox tradition.'],
      ['John Sullivan', 'Holy Cross Cathedral', 'Catholic', 'funeral', '1918-11-05', 'Boston, Massachusetts', 'Funeral mass during influenza pandemic.'],
      ['Anna Kowalski', 'Holy Name of Jesus', 'Catholic', 'baptism', '1895-03-07', 'Krakow, Poland', 'Polish Catholic baptismal record.'],
      ['Catherine Murphy', 'St. Patrick\'s Church', 'Catholic', 'baptism', '1950-06-22', 'Dublin, Ireland', 'Baptized at historic Dublin parish.'],
    ];
    for (const c of churchRecords) {
      await pool.query(
        `INSERT INTO church_records (person_name, church_name, denomination, record_type, event_date, location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        c
      );
    }
    console.log(`Seeded ${churchRecords.length} church_records`);

    // Seed ship_manifests
    const shipManifests = [
      ['SS City of Washington', 'Queenstown, Ireland', 'Boston, Massachusetts', '1862-07-25', '1862-08-20', 'John Sullivan', 20, 'Irish', 'Laborer', 'Steerage class. 26-day voyage.'],
      ['SS Cunard Line', 'Queenstown, Ireland', 'Boston, Massachusetts', '1864-02-15', '1864-03-12', 'Mary O\'Brien', 19, 'Irish', 'Domestic Servant', 'Traveled with cousin Brigid O\'Brien.'],
      ['SS Cunard Line', 'Queenstown, Ireland', 'Boston, Massachusetts', '1864-02-15', '1864-03-12', 'Brigid O\'Brien', 22, 'Irish', 'Seamstress', 'Traveled with cousin Mary.'],
      ['SS Hermann', 'Bremen, Germany', 'New York, New York', '1855-08-15', '1855-10-01', 'Heinrich Mueller', 20, 'German', 'Brewer', 'Emigrated after 1848 revolution.'],
      ['SS Hermann', 'Bremen, Germany', 'New York, New York', '1855-08-15', '1855-10-01', 'Friedrich Mueller', 18, 'German', 'Apprentice', 'Heinrich\'s brother.'],
      ['SS Kaiser Wilhelm der Grosse', 'Hamburg, Germany', 'New York, New York', '1910-05-01', '1910-05-15', 'Anna Kowalski', 15, 'Polish', 'None', 'Accompanied by uncle Stefan.'],
      ['SS Kaiser Wilhelm der Grosse', 'Hamburg, Germany', 'New York, New York', '1910-05-01', '1910-05-15', 'Stefan Kowalski', 40, 'Polish', 'Blacksmith', 'Accompanied niece Anna.'],
      ['SS Rotterdam', 'Rotterdam, Netherlands', 'New York, New York', '1905-08-20', '1905-09-12', 'Ivan Petrov', 30, 'Russian', 'Tailor', 'Fleeing pogroms. Family of three.'],
      ['SS Rotterdam', 'Rotterdam, Netherlands', 'New York, New York', '1905-08-20', '1905-09-12', 'Olga Petrov', 28, 'Russian', 'None', 'Wife of Ivan.'],
      ['SS Rotterdam', 'Rotterdam, Netherlands', 'New York, New York', '1905-08-20', '1905-09-12', 'Alexei Petrov', 3, 'Russian', 'None', 'Son of Ivan and Olga.'],
      ['SS China', 'Hong Kong, China', 'San Francisco, California', '1920-05-01', '1920-06-10', 'Chen Mingzhu', 25, 'Chinese', 'Merchant', 'Detained at Angel Island for 3 weeks.'],
      ['SS Great Eastern', 'Queenstown, Ireland', 'Boston, Massachusetts', '1860-04-01', '1860-05-10', 'Patrick Sullivan', 25, 'Irish', 'Farmer', 'John\'s older brother.'],
      ['SS Imperator', 'Hamburg, Germany', 'New York, New York', '1912-07-15', '1912-08-03', 'Rosa Kowalski', 20, 'Polish', 'None', 'Anna\'s sister.'],
      ['SS President Taft', 'Shanghai, China', 'San Francisco, California', '1925-01-10', '1925-02-14', 'Chen Liwei', 22, 'Chinese', 'Cook', 'Mingzhu\'s cousin.'],
      ['SS Rhein', 'Bremen, Germany', 'New York, New York', '1905-03-25', '1905-04-20', 'Stefan Kowalski', 35, 'Polish', 'Blacksmith', 'First trip to America before returning for Anna.'],
    ];
    for (const s of shipManifests) {
      await pool.query(
        `INSERT INTO ship_manifests (ship_name, departure_port, arrival_port, departure_date, arrival_date, passenger_name, age, nationality, occupation, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        s
      );
    }
    console.log(`Seeded ${shipManifests.length} ship_manifests`);

    // Seed documents
    const documents = [
      ['Sullivan Family Bible', 'family_bible', 'Family Bible with births, marriages, and deaths recorded in the front pages.', '/documents/sullivan-bible.pdf', 'Sullivan Family', '1842-01-01', 'Spans multiple generations.'],
      ['John Sullivan Naturalization Certificate', 'legal', 'Certificate of naturalization for John Sullivan, 1868.', '/documents/sullivan-naturalization.pdf', 'John Sullivan', '1868-03-20', 'Original document in family collection.'],
      ['Civil War Discharge Papers', 'military', 'Honorable discharge papers for John Sullivan from the 28th Massachusetts.', '/documents/sullivan-discharge.pdf', 'John Sullivan', '1865-04-15', 'Includes service record summary.'],
      ['Mueller Brewery Photograph', 'photograph', 'Photograph of Heinrich Mueller standing in front of his brewery, circa 1885.', '/documents/mueller-brewery.jpg', 'Heinrich Mueller', '1885-01-01', 'Earliest known family photograph.'],
      ['Sullivan Wedding Photograph', 'photograph', 'Wedding photograph of William Sullivan and Helen Petrov, 1945.', '/documents/sullivan-petrov-wedding.jpg', 'William Sullivan', '1945-12-20', 'Black and white studio portrait.'],
      ['WWI Letters from James Sullivan', 'correspondence', 'Collection of letters sent home by James Sullivan during WWI service in France.', '/documents/wwi-letters/', 'James Sullivan', '1918-01-01', '12 letters preserved in acid-free folders.'],
      ['Anna Kowalski Ellis Island Photo', 'photograph', 'Photograph taken at Ellis Island processing center, 1910.', '/documents/kowalski-ellis-island.jpg', 'Anna Kowalski', '1910-05-15', 'Group photo of arriving immigrants.'],
      ['Purple Heart Certificate', 'military', 'Purple Heart award certificate for PFC William Sullivan.', '/documents/purple-heart.pdf', 'William Sullivan', '1944-06-06', 'D-Day wound citation.'],
      ['Sullivan Family Tree Chart', 'genealogy', 'Hand-drawn family tree chart from the 1960s.', '/documents/family-tree-chart.pdf', 'Sullivan Family', '1960-01-01', 'Created by William Sullivan.'],
      ['Property Deed 1870', 'legal', 'Original deed for John Sullivan\'s Boston property purchase.', '/documents/deed-1870.pdf', 'John Sullivan', '1870-05-15', 'Suffolk County Registry.'],
      ['Petrov Family Passport', 'legal', 'Russian Empire passport for the Petrov family, 1905.', '/documents/petrov-passport.pdf', 'Ivan Petrov', '1905-07-01', 'Pre-emigration document.'],
      ['Chen Immigration Papers', 'legal', 'Immigration papers and Angel Island detention record for Chen Mingzhu.', '/documents/chen-immigration.pdf', 'Chen Mingzhu', '1920-06-10', 'Includes detention interview transcript.'],
      ['Vietnam Service Photos', 'photograph', 'Photographs from Robert Sullivan\'s Vietnam service.', '/documents/vietnam-photos/', 'Robert Sullivan', '1969-01-01', 'Collection of 24 photographs.'],
      ['Catherine Murphy Passport', 'legal', 'Irish passport of Catherine Murphy, 1970.', '/documents/murphy-passport.pdf', 'Catherine Murphy', '1970-01-15', 'Pre-emigration document.'],
      ['Sullivan Reunion Photo 1960', 'photograph', 'Large group photo from the 1960 Sullivan Family Reunion at Franklin Park.', '/documents/reunion-1960.jpg', 'Sullivan Family', '1960-07-04', 'Over 50 family members pictured.'],
    ];
    for (const d of documents) {
      await pool.query(
        `INSERT INTO documents (title, doc_type, description, file_path, person_name, date_created, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        d
      );
    }
    console.log(`Seeded ${documents.length} documents`);

    // Seed research_notes
    const researchNotes = [
      ['Sullivan Origin Research', 'origin', 'The Sullivan name (O\'Suilleabhain) originates from County Cork and County Kerry. The name means "dark-eyed" or "hawk-eyed." Our branch appears to come from the Bantry area of County Cork.', 'Irish Surnames by Edward MacLysaght', 'John Sullivan'],
      ['Irish Famine Connection', 'immigration', 'John Sullivan likely emigrated due to the aftermath of the Great Famine (1845-1852). Though the worst was over by 1862, economic conditions remained poor in rural Cork.', 'The Great Hunger by Cecil Woodham-Smith', 'John Sullivan'],
      ['Civil War Irish Brigade', 'military', 'The 28th Massachusetts was part of the famous Irish Brigade. They fought at Antietam, Fredericksburg, Gettysburg, and other major battles. Heavy casualties among Irish soldiers.', 'The Irish Brigade by Thomas J. Craughwell', 'John Sullivan'],
      ['Kowalski Polish Origins', 'origin', 'Kowalski is one of the most common Polish surnames, derived from "kowal" meaning blacksmith. The family came from the Krakow region of Galicia, then under Austro-Hungarian rule.', 'Polish Surnames by William F. Hoffman', 'Anna Kowalski'],
      ['Petrov Russian Jewish Heritage', 'origin', 'The Petrov family appears to have been Jewish, living in the Pale of Settlement in Odessa. They likely emigrated due to anti-Jewish pogroms in the early 1900s.', 'When They Are Gone by Yefim Kogan', 'Ivan Petrov'],
      ['Mueller Brewing History', 'occupation', 'Heinrich Mueller was part of the wave of German brewers who made Milwaukee the beer capital of America. His brewery operated from 1870 to 1920 (closed during Prohibition).', 'Brewed in Milwaukee by John Gurda', 'Heinrich Mueller'],
      ['D-Day Research', 'military', 'William Sullivan landed with the 1st Infantry Division at Omaha Beach on June 6, 1944. The "Big Red One" suffered heavy casualties. William was wounded in the leg by shrapnel.', 'D-Day by Stephen Ambrose', 'William Sullivan'],
      ['Angel Island Detention', 'immigration', 'Chen Mingzhu was detained at Angel Island for three weeks in 1920. Chinese immigrants faced harsh interrogation under the Chinese Exclusion Act. Many were deported.', 'Island: Poetry and History of Chinese Immigrants', 'Chen Mingzhu'],
      ['Sullivan-Walsh Connection', 'family', 'Margaret Walsh\'s family came from Lowell, Massachusetts. Her father was a textile mill worker. The Walsh and Sullivan families may have known each other through the Catholic church.', 'Lowell Irish Community Records', 'Margaret Walsh'],
      ['Vietnam Era Draft', 'military', 'Robert Sullivan was drafted in 1968 during the height of the Vietnam War. He served with the 25th Infantry Division, known as "Tropic Lightning," based at Cu Chi.', 'Vietnam War records at NARA', 'Robert Sullivan'],
      ['DNA Testing Strategy', 'dna', 'Recommended testing: AncestryDNA for broad matching, 23andMe for health data, FTDNA for Y-DNA (Sullivan paternal line). Consider mtDNA testing for maternal O\'Brien line.', 'Genetic Genealogy in Practice', 'Patrick Sullivan'],
      ['Chen Family in Chinatown', 'community', 'The Chen family settled in San Francisco\'s Chinatown around 1920. They operated a small grocery store on Grant Avenue. The community faced significant discrimination.', 'San Francisco Chinatown Archives', 'Chen Mingzhu'],
      ['1918 Flu Pandemic Impact', 'medical', 'John Sullivan died during the 1918 influenza pandemic, one of an estimated 675,000 Americans who perished. Boston was particularly hard hit in late 1918.', 'The Great Influenza by John M. Barry', 'John Sullivan'],
      ['Irish Church Records', 'source', 'Church records in Ireland are the primary source for pre-1864 vital records. The Catholic Parish Registers for Bantry, Cork are available through the National Library of Ireland.', 'Irish Genealogical Research Guide', 'John Sullivan'],
      ['Murphy Modern Immigration', 'immigration', 'Catherine Murphy\'s immigration in 1970 represents the modern wave of Irish immigration. Unlike earlier immigrants, she came by air and had professional skills as a secretary.', 'The New Irish Americans by Ronald Bayor', 'Catherine Murphy'],
    ];
    for (const r of researchNotes) {
      await pool.query(
        `INSERT INTO research_notes (title, category, content, source, person_name)
         VALUES ($1,$2,$3,$4,$5)`,
        r
      );
    }
    console.log(`Seeded ${researchNotes.length} research_notes`);

    // Seed source_citations
    const sourceCitations = [
      ['1870 United States Federal Census', 'census', 'US Census Bureau', 'National Archives', '1870-06-01', 'https://www.ancestry.com', 'National Archives, Washington, DC', 'Suffolk County, Massachusetts enumeration.'],
      ['Massachusetts Vital Records 1841-1910', 'vital_records', 'Commonwealth of Massachusetts', 'New England Historic Genealogical Society', null, 'https://www.americanancestors.org', 'NEHGS, Boston', 'Covers births, marriages, and deaths.'],
      ['Ellis Island Passenger Records', 'immigration', 'Ellis Island Foundation', 'Statue of Liberty-Ellis Island Foundation', null, 'https://www.libertyellisfoundation.org', 'Ellis Island, New York', 'Free online database of arrivals.'],
      ['Boston Pilot Newspaper Archives', 'newspaper', 'Boston Pilot Staff', 'Boston College Libraries', null, 'https://newspapers.bc.edu', 'Boston College, Chestnut Hill, MA', 'Irish-American newspaper archives.'],
      ['National Personnel Records Center', 'military', 'US Government', 'NPRC', null, 'https://www.archives.gov/personnel-records-center', 'St. Louis, Missouri', 'Military service records (fire of 1973 destroyed many).'],
      ['Cork County Parish Registers', 'church', 'Catholic Diocese of Cork', 'National Library of Ireland', null, 'https://registers.nli.ie', 'National Library of Ireland, Dublin', 'Digitized parish registers.'],
      ['Kerry County Parish Registers', 'church', 'Catholic Diocese of Kerry', 'National Library of Ireland', null, 'https://registers.nli.ie', 'National Library of Ireland, Dublin', 'Covers Killarney and surrounding parishes.'],
      ['Worcester County Registry of Deeds', 'land', 'Worcester County', 'Worcester County Government', null, 'https://www.worcesterdeeds.com', 'Worcester, Massachusetts', 'Land transaction records.'],
      ['AncestryDNA Database', 'dna', 'Ancestry.com', 'Ancestry', null, 'https://www.ancestry.com/dna', 'Online', 'DNA matching and ethnicity estimates.'],
      ['Milwaukee County Historical Society', 'archive', 'Various', 'Milwaukee County Historical Society', null, 'https://www.milwaukeehistory.net', 'Milwaukee, Wisconsin', 'Local history and genealogy resources.'],
      ['Angel Island Immigration Station Records', 'immigration', 'US Immigration Service', 'National Archives Pacific Region', null, 'https://www.archives.gov', 'San Bruno, California', 'Chinese immigration records.'],
      ['Irish Surnames: Their Origins and Meanings', 'reference', 'Edward MacLysaght', 'Irish Academic Press', '1985-01-01', null, 'Library collection', 'Standard reference for Irish surname research.'],
      ['Boston Globe Historical Archives', 'newspaper', 'Boston Globe Staff', 'Boston Globe', null, 'https://www.bostonglobe.com/archives', 'Boston, Massachusetts', 'Obituaries and announcements.'],
      ['Hartford Courant Archives', 'newspaper', 'Hartford Courant Staff', 'Hartford Courant', null, 'https://www.courant.com', 'Hartford, Connecticut', 'America\'s oldest continuously published newspaper.'],
      ['FamilySearch.org Collections', 'archive', 'The Church of Jesus Christ of Latter-day Saints', 'FamilySearch International', null, 'https://www.familysearch.org', 'Salt Lake City, Utah', 'Free genealogy records worldwide.'],
    ];
    for (const s of sourceCitations) {
      await pool.query(
        `INSERT INTO source_citations (title, source_type, author, publication, date_published, url, repository, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        s
      );
    }
    console.log(`Seeded ${sourceCitations.length} source_citations`);

    console.log('\nSeeding complete! All tables populated with realistic genealogy data.');
  } catch (err) {
    console.error('Seeding error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
