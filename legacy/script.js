const units = [
  {
    id: "cs-1",
    number: 1,
    title: "Data representation",
    group: "Computer systems",
    description: "Binary, numbers, text, images, sound, compression and encoding.",
    terms: [
      { term: "Bit", topic: "Numbers", definition: "Smallest unit of data; represents 0 or 1.", example: "A single on/off state, e.g., 1 or 0.", misconception: "Assuming 1 always means 'true' in all contexts.", contrast: "Bit vs Byte" },
      { term: "Nibble", topic: "Numbers", definition: "Group of 4 bits.", example: "1010₂ is a nibble.", contrast: "Nibble vs Byte" },
      { term: "Byte", topic: "Numbers", definition: "Group of 8 bits.", example: "11110000₂ is one byte (240₁₀).", misconception: "1 byte equals 1 character universally (not with Unicode)." },
      { term: "Binary", topic: "Numbers", definition: "Base-2 number system using digits 0 and 1.", example: "1010₂ = 10₁₀.", misconception: "Reading 10₂ as denary ten.", contrast: "Binary vs Denary" },
      { term: "Denary", topic: "Numbers", definition: "Base-10 number system using digits 0–9.", contrast: "Denary vs Binary" },
      { term: "Hexadecimal", topic: "Numbers", definition: "Base-16 number system using 0–9 and A–F.", example: "FF₁₆ = 255₁₀.", misconception: "Assuming A equals 11; A is 10." },
      { term: "Overflow", topic: "Numbers", definition: "Condition when a value exceeds the representable range.", example: "8-bit unsigned: 255 + 1 wraps to 0." },
      { term: "Character set", topic: "Text", definition: "Collection of characters each with a unique code.", example: "ASCII maps 'A' to 65.", contrast: "ASCII vs Unicode" },
      { term: "ASCII", topic: "Text", definition: "7/8-bit character encoding for Latin characters.", example: "Newline is 10 in ASCII.", misconception: "ASCII covers all languages." },
      { term: "Unicode", topic: "Text", definition: "Universal character encoding standard with code points.", example: "😀 U+1F600.", contrast: "Unicode vs Extended ASCII" },
      { term: "Pixel", topic: "Images", definition: "Smallest addressable element of a raster image.", example: "A 1920×1080 image has 2,073,600 pixels." },
      { term: "Resolution", topic: "Images", definition: "Number of pixels in each dimension of an image.", misconception: "Higher resolution always means smaller file size." },
      { term: "Colour depth", topic: "Images", definition: "Bits used to represent the colour of a pixel.", example: "24-bit colour ≈ 16.7 million colours.", contrast: "8-bit vs 24-bit" },
      { term: "Metadata", topic: "Images", definition: "Data describing other data such as dimensions or format.", example: "EXIF stores camera model and timestamp." },
      { term: "Raster graphics", topic: "Images", definition: "Images represented as a grid of pixels.", contrast: "Raster vs Vector" },
      { term: "Vector graphics", topic: "Images", definition: "Images defined using geometric primitives.", example: "SVG logo scales without pixelation." },
      { term: "Sample rate", topic: "Sound", definition: "Samples per second measured in Hz.", example: "44.1 kHz for CD audio." },
      { term: "Bit rate", topic: "Sound", definition: "Bits transmitted/stored per second.", example: "128 kbps MP3." },
      { term: "Sampling resolution", topic: "Sound", definition: "Bits used to store each sample’s amplitude.", contrast: "Sample rate vs Resolution" },
      { term: "Compression", topic: "Compression", definition: "Reducing file size while preserving information.", contrast: "Lossless vs Lossy" },
      { term: "Lossless compression", topic: "Compression", definition: "Compression without losing information.", example: "PNG images." },
      { term: "Lossy compression", topic: "Compression", definition: "Compression that removes some information.", example: "JPEG images." },
      { term: "Run-length encoding (RLE)", topic: "Compression", definition: "Encoding consecutive repeated values as count-value pairs.", example: "AAAAA → 5A.", misconception: "Effective for random data (it is not)." }
    ]
  },
  {
    id: "cs-2",
    number: 2,
    title: "Data transmission",
    group: "Computer systems",
    description: "Transmission modes, errors, protocols and switching.",
    terms: [
      { term: "Serial transmission", topic: "Modes", definition: "Bits sent one after another over a single channel." },
      { term: "Parallel transmission", topic: "Modes", definition: "Multiple bits sent simultaneously across several channels." },
      { term: "Synchronous", topic: "Modes", definition: "Transmission driven by shared clock signal." },
      { term: "Asynchronous", topic: "Modes", definition: "Transmission with start/stop bits and no shared clock." },
      { term: "Simplex", topic: "Modes", definition: "Communication in one direction only." },
      { term: "Half-duplex", topic: "Modes", definition: "Communication both ways but not at the same time." },
      { term: "Full-duplex", topic: "Modes", definition: "Communication both ways simultaneously." },
      { term: "Bandwidth", topic: "Performance", definition: "Maximum data transfer rate of a network path." },
      { term: "Latency", topic: "Performance", definition: "Time delay between sending and receiving data." },
      { term: "Throughput", topic: "Performance", definition: "Actual rate of successful data transfer." },
      { term: "Packet", topic: "Packets", definition: "Unit of data sent across a network with header and payload." },
      { term: "Header", topic: "Packets", definition: "Control information at the start of a packet." },
      { term: "Payload", topic: "Packets", definition: "User data carried in a packet." },
      { term: "Trailer", topic: "Packets", definition: "Data at the end of a packet, often for error checking." },
      { term: "Checksum", topic: "Errors", definition: "Calculated value used to detect errors in data." },
      { term: "Parity bit", topic: "Errors", definition: "Bit added to make the total number of 1s even/odd." },
      { term: "Even parity", topic: "Errors", definition: "Parity method ensuring an even number of 1s." },
      { term: "Odd parity", topic: "Errors", definition: "Parity method ensuring an odd number of 1s." },
      { term: "ARQ", topic: "Errors", definition: "Automatic repeat request protocol for retransmission." },
      { term: "ACK/NACK", topic: "Errors", definition: "Positive/negative acknowledgements to confirm receipt." },
      { term: "Handshaking", topic: "Protocols", definition: "Negotiation to establish communication settings." },
      { term: "Protocol", topic: "Protocols", definition: "Agreed rules for data communication." },
      { term: "Packet switching", topic: "Switching", definition: "Data split into packets routed independently." },
      { term: "Circuit switching", topic: "Switching", definition: "Dedicated path established for the duration of communication." },
      { term: "Buffering", topic: "Control", definition: "Storing data temporarily to manage differences in speed." },
      { term: "Flow control", topic: "Control", definition: "Techniques to prevent sender overwhelming receiver." }
    ]
  },
  {
    id: "cs-3",
    number: 3,
    title: "Hardware",
    group: "Computer systems",
    description: "Components, architecture, input/output and storage.",
    terms: [
      { term: "CPU", topic: "Architecture", definition: "Central processing unit executing instructions." },
      { term: "ALU", topic: "Architecture", definition: "Arithmetic logic unit performing operations." },
      { term: "Control unit", topic: "Architecture", definition: "Directs operations of the processor." },
      { term: "Clock", topic: "Architecture", definition: "Generates timing signals controlling the processor." },
      { term: "Register", topic: "Architecture", definition: "Small, fast storage within the CPU." },
      { term: "Cache memory", topic: "Memory", definition: "Fast memory storing frequently accessed data." },
      { term: "RAM", topic: "Memory", definition: "Volatile main memory for programs and data in use." },
      { term: "ROM", topic: "Memory", definition: "Non-volatile memory storing firmware." },
      { term: "Bus", topic: "Architecture", definition: "Set of wires carrying data, addresses and control signals." },
      { term: "Data bus", topic: "Architecture", definition: "Transfers actual data between components." },
      { term: "Address bus", topic: "Architecture", definition: "Carries memory addresses for data access." },
      { term: "Control bus", topic: "Architecture", definition: "Carries control signals coordinating operations." },
      { term: "Von Neumann architecture", topic: "Architecture", definition: "Shared memory for instructions and data." },
      { term: "Input device", topic: "I/O", definition: "Hardware used to enter data into a system." },
      { term: "Output device", topic: "I/O", definition: "Hardware used to present data from a system." },
      { term: "Sensor", topic: "I/O", definition: "Device detecting physical properties to produce data." },
      { term: "Actuator", topic: "I/O", definition: "Device converting data signals into physical action." },
      { term: "Secondary storage", topic: "Storage", definition: "Non-volatile storage for long-term data." },
      { term: "HDD", topic: "Storage", definition: "Magnetic storage using spinning disks." },
      { term: "SSD", topic: "Storage", definition: "Solid-state storage using flash memory." },
      { term: "Optical storage", topic: "Storage", definition: "Storage using lasers to read/write data." },
      { term: "Magnetic tape", topic: "Storage", definition: "Sequential access magnetic storage medium." },
      { term: "Embedded system", topic: "Systems", definition: "Computer dedicated to a specific function within a larger system." },
      { term: "Microcontroller", topic: "Systems", definition: "Integrated chip with CPU, memory and I/O for control tasks." },
      { term: "GPU", topic: "Systems", definition: "Processor specialized for graphics and parallel tasks." }
    ]
  },
  {
    id: "cs-4",
    number: 4,
    title: "Software",
    group: "Computer systems",
    description: "System software, application software and language translators.",
    terms: [
      { term: "System software", topic: "Software", definition: "Software managing and supporting computer operations." },
      { term: "Application software", topic: "Software", definition: "Programs designed for end-user tasks." },
      { term: "Utility software", topic: "Software", definition: "Programs performing maintenance or optimization tasks." },
      { term: "Firmware", topic: "Software", definition: "Software stored in ROM controlling hardware." },
      { term: "Operating system", topic: "OS", definition: "Manages hardware, resources and provides user interface." },
      { term: "Device driver", topic: "OS", definition: "Software controlling communication with hardware devices." },
      { term: "User interface", topic: "OS", definition: "Means by which users interact with a computer." },
      { term: "CLI", topic: "OS", definition: "Command-line interface using typed commands." },
      { term: "GUI", topic: "OS", definition: "Graphical user interface using windows, icons and menus." },
      { term: "Multitasking", topic: "OS", definition: "Running multiple tasks apparently simultaneously." },
      { term: "Scheduling", topic: "OS", definition: "Deciding which process runs and for how long." },
      { term: "Memory management", topic: "OS", definition: "Allocation and control of primary memory." },
      { term: "File management", topic: "OS", definition: "Creation, storage and access of files and directories." },
      { term: "Process management", topic: "OS", definition: "Scheduling and control of running tasks." },
      { term: "Security", topic: "OS", definition: "Authentication, authorization and protection mechanisms." },
      { term: "Translator", topic: "Languages", definition: "Software converting source code into machine code." },
      { term: "Compiler", topic: "Languages", definition: "Translates whole program to object code before execution." },
      { term: "Interpreter", topic: "Languages", definition: "Executes program line by line translating at runtime." },
      { term: "Assembler", topic: "Languages", definition: "Converts assembly language to machine code." },
      { term: "Source code", topic: "Languages", definition: "Human-readable program text." },
      { term: "Object code", topic: "Languages", definition: "Machine code produced by a translator." },
      { term: "High-level language", topic: "Languages", definition: "Language close to human readability and abstraction." },
      { term: "Low-level language", topic: "Languages", definition: "Language close to machine operations and hardware." },
      { term: "Open source", topic: "Software", definition: "Software released with source code and permissive license." },
      { term: "Proprietary software", topic: "Software", definition: "Software licensed with restricted use and access." },
      { term: "IDE", topic: "Tools", definition: "Integrated development environment supporting coding tasks." }
    ]
  },
  {
    id: "cs-5",
    number: 5,
    title: "The internet and its uses",
    group: "Computer systems",
    description: "Web technologies, services, security and communication.",
    terms: [
      { term: "Internet", topic: "Web", definition: "Global network of interconnected networks." },
      { term: "World Wide Web", topic: "Web", definition: "Interlinked documents and resources accessed via browsers." },
      { term: "URL", topic: "Web", definition: "Uniform Resource Locator identifying a resource." },
      { term: "Domain name", topic: "Web", definition: "Human-readable address of an internet resource." },
      { term: "DNS", topic: "Web", definition: "Domain Name System translating names to IP addresses." },
      { term: "IP address", topic: "Web", definition: "Numerical label identifying a device on a network." },
      { term: "HTTP", topic: "Web", definition: "HyperText Transfer Protocol for web communication." },
      { term: "HTTPS", topic: "Web", definition: "Secure version of HTTP using TLS encryption." },
      { term: "HTML", topic: "Web", definition: "Markup language for structuring web content." },
      { term: "CSS", topic: "Web", definition: "Style sheet language for describing presentation." },
      { term: "JavaScript", topic: "Web", definition: "Programming language for dynamic web content." },
      { term: "ISP", topic: "Web", definition: "Internet Service Provider offering connectivity." },
      { term: "Email", topic: "Communication", definition: "Electronic mail system for messages." },
      { term: "FTP", topic: "Communication", definition: "File Transfer Protocol for moving files." },
      { term: "Cookie", topic: "Web", definition: "Small data stored by a browser for a website." },
      { term: "Cloud computing", topic: "Cloud", definition: "Delivery of computing services over the internet." },
      { term: "Firewall", topic: "Security", definition: "Network security system controlling traffic." },
      { term: "Malware", topic: "Security", definition: "Malicious software designed to cause harm." },
      { term: "Phishing", topic: "Security", definition: "Fraudulent attempt to obtain sensitive information." },
      { term: "Trojan", topic: "Security", definition: "Malware disguised as legitimate software." },
      { term: "Spyware", topic: "Security", definition: "Malware that secretly gathers information." },
      { term: "Antivirus", topic: "Security", definition: "Software that detects and removes malware." },
      { term: "Encryption", topic: "Security", definition: "Converting data into a secure coded form." },
      { term: "TLS/SSL", topic: "Security", definition: "Protocols providing secure communication." },
      { term: "Digital certificate", topic: "Security", definition: "Electronic document verifying identity and public key." },
      { term: "Digital signature", topic: "Security", definition: "Cryptographic proof of content integrity and origin." },
      { term: "Authentication", topic: "Security", definition: "Verifying user identity." },
      { term: "Two-factor authentication", topic: "Security", definition: "Authentication using two independent methods." },
      { term: "VPN", topic: "Security", definition: "Virtual private network providing secure tunnelling." },
      { term: "Proxy server", topic: "Security", definition: "Intermediate server forwarding requests." }
    ]
  },
  {
    id: "cs-6",
    number: 6,
    title: "Automated and emerging technologies",
    group: "Computer systems",
    description: "Automation, AI, robotics, IoT and ethical considerations.",
    terms: [
      { term: "Automation", topic: "Automation", definition: "Use of technology to perform tasks with minimal human input." },
      { term: "Artificial intelligence", topic: "AI", definition: "Systems that perform tasks requiring human intelligence." },
      { term: "Machine learning", topic: "AI", definition: "Algorithms improving performance through data experience." },
      { term: "Expert system", topic: "AI", definition: "Computer system emulating decision-making of human experts." },
      { term: "Robotics", topic: "Robotics", definition: "Design and use of robots for tasks." },
      { term: "Computer vision", topic: "AI", definition: "Enabling computers to interpret visual information." },
      { term: "Natural language processing", topic: "AI", definition: "Computational techniques for understanding human language." },
      { term: "Speech recognition", topic: "AI", definition: "Converting spoken language to text." },
      { term: "Actuator", topic: "Robotics", definition: "Device converting signals into physical movement." },
      { term: "Sensor", topic: "Robotics", definition: "Device detecting changes in environment." },
      { term: "Internet of Things", topic: "IoT", definition: "Network of connected devices collecting and sharing data." },
      { term: "Wearable technology", topic: "IoT", definition: "Electronics worn on the body collecting data." },
      { term: "Autonomous vehicle", topic: "Robotics", definition: "Vehicle capable of self-navigation without human input." },
      { term: "Drone", topic: "Robotics", definition: "Unmanned aerial vehicle controlled remotely or autonomously." },
      { term: "Big data", topic: "Data", definition: "Large, complex datasets requiring advanced processing." },
      { term: "Data mining", topic: "Data", definition: "Discovering patterns and insights in large datasets." },
      { term: "Biometric authentication", topic: "Security", definition: "Identification using biological characteristics." },
      { term: "3D printing", topic: "Manufacturing", definition: "Creating physical objects layer by layer from a digital model." },
      { term: "AR", topic: "XR", definition: "Augmented reality overlaying digital content onto the real world." },
      { term: "VR", topic: "XR", definition: "Virtual reality creating immersive simulated environments." },
      { term: "Ethical bias", topic: "Ethics", definition: "Systematic errors unfairly affecting groups or outcomes." },
      { term: "Transparency", topic: "Ethics", definition: "Clarity about how systems operate and make decisions." },
      { term: "Explainability", topic: "Ethics", definition: "Ability to understand and justify system outputs." }
    ]
  },
  {
    id: "apl-7",
    number: 7,
    title: "Algorithm design and problem-solving",
    group: "Algorithms, programming and logic",
    description: "Decomposition, abstraction, pseudocode, flowcharts, testing and standard algorithms.",
    terms: [
      { term: "Problem decomposition", topic: "Design", definition: "Breaking a problem into smaller manageable parts." },
      { term: "Abstraction", topic: "Design", definition: "Hiding unnecessary detail to focus on relevant aspects." },
      { term: "Algorithm", topic: "Design", definition: "Finite sequence of steps to solve a problem." },
      { term: "Pseudocode", topic: "Design", definition: "Structured English describing algorithms independent of language." },
      { term: "Flowchart", topic: "Design", definition: "Diagram representing sequence and control flow." },
      { term: "Trace table", topic: "Testing", definition: "Table tracking variable values step by step." },
      { term: "Dry run", topic: "Testing", definition: "Manual simulation of code to check logic." },
      { term: "Test plan", topic: "Testing", definition: "Structured approach outlining tests to validate software." },
      { term: "Normal data", topic: "Testing", definition: "Typical valid inputs expected during regular use." },
      { term: "Boundary data", topic: "Testing", definition: "Inputs at the extremes of acceptable ranges." },
      { term: "Erroneous data", topic: "Testing", definition: "Inputs with incorrect types or invalid values." },
      { term: "Validation", topic: "Testing", definition: "Checking input meets format or constraints." },
      { term: "Verification", topic: "Testing", definition: "Ensuring product meets specification and intent." },
      { term: "Linear search", topic: "Algorithms", definition: "Searching sequentially through a list." },
      { term: "Binary search", topic: "Algorithms", definition: "Searching a sorted list by halving the search space." },
      { term: "Bubble sort", topic: "Algorithms", definition: "Repeatedly swapping adjacent out-of-order elements." },
      { term: "Insertion sort", topic: "Algorithms", definition: "Building sorted list by inserting elements into position." },
      { term: "Merge sort", topic: "Algorithms", definition: "Divide and conquer sorting by merging sorted sublists." },
      { term: "Efficiency", topic: "Algorithms", definition: "Measure of resources used by an algorithm." }
    ]
  },
  {
    id: "apl-8",
    number: 8,
    title: "Programming",
    group: "Algorithms, programming and logic",
    description: "Data types, variables, control structures, arrays and subroutines.",
    terms: [
      { term: "Variable", topic: "Basics", definition: "Named storage location holding a value." },
      { term: "Constant", topic: "Basics", definition: "Value that does not change during execution." },
      { term: "Integer", topic: "Types", definition: "Whole number data type." },
      { term: "Real", topic: "Types", definition: "Numeric data type representing real numbers (IG scope: used without floating-point internals)." },
      { term: "Boolean", topic: "Types", definition: "Logical true/false data type." },
      { term: "Character", topic: "Types", definition: "Single symbol data type." },
      { term: "String", topic: "Types", definition: "Sequence of characters." },
      { term: "Casting", topic: "Types", definition: "Converting a value from one data type to another." },
      { term: "Input/Output", topic: "Basics", definition: "Reading data from user and displaying results." },
      { term: "Assignment", topic: "Basics", definition: "Storing a value in a variable." },
      { term: "Arithmetic operator", topic: "Operators", definition: "Performs mathematical operations (+, −, ×, ÷)." },
      { term: "Relational operator", topic: "Operators", definition: "Compares values to produce Boolean results." },
      { term: "Logical operator", topic: "Operators", definition: "Combines/complements Boolean expressions." },
      { term: "Sequence", topic: "Control", definition: "Ordered execution of statements." },
      { term: "Selection", topic: "Control", definition: "Branching based on a condition (IF/ELSE)." },
      { term: "Iteration", topic: "Control", definition: "Looping to repeat a block of code." },
      { term: "FOR loop", topic: "Control", definition: "Definite iteration over a range or count." },
      { term: "WHILE loop", topic: "Control", definition: "Indefinite iteration while condition is true." },
      { term: "REPEAT…UNTIL", topic: "Control", definition: "Loop executing until condition becomes true." },
      { term: "Array", topic: "Structures", definition: "Indexed collection of elements of the same type." },
      { term: "2D Array", topic: "Structures", definition: "Array of arrays accessed by row and column." },
      { term: "String operations", topic: "Structures", definition: "Concatenation, substring, length and indexing." },
      { term: "Subroutine", topic: "Procedures", definition: "Named block of code performing a task." },
      { term: "Procedure", topic: "Procedures", definition: "Subroutine that does not return a value." },
      { term: "Function", topic: "Procedures", definition: "Subroutine that returns a value." },
      { term: "Parameter", topic: "Procedures", definition: "Variable used to pass data into a subroutine." },
      { term: "Argument", topic: "Procedures", definition: "Actual value passed to a subroutine." },
      { term: "Return value", topic: "Procedures", definition: "Data sent back from a function to the caller." },
      { term: "Scope", topic: "Procedures", definition: "Visibility of variables (local/global)." },
      { term: "Library", topic: "Procedures", definition: "Reusable set of prewritten functions." }
    ]
  },
  {
    id: "apl-9",
    number: 9,
    title: "Databases",
    group: "Algorithms, programming and logic",
    description: "Relational concepts, keys, SQL and normalisation.",
    terms: [
      { term: "Database", topic: "Concepts", definition: "Organised collection of related data." },
      { term: "Table", topic: "Concepts", definition: "Structure containing records arranged in fields and rows." },
      { term: "Record", topic: "Concepts", definition: "Single row of related data in a table." },
      { term: "Field", topic: "Concepts", definition: "Single column representing an attribute." },
      { term: "Primary key", topic: "Keys", definition: "Unique identifier for a record." },
      { term: "Foreign key", topic: "Keys", definition: "Field referencing a primary key in another table." },
      { term: "Candidate key", topic: "Keys", definition: "Field(s) that could uniquely identify a record." },
      { term: "Composite key", topic: "Keys", definition: "Key composed of multiple fields." },
      { term: "Index", topic: "Performance", definition: "Structure improving query speed for a field." },
      { term: "Flat file", topic: "Concepts", definition: "Single table database without relations." },
      { term: "Relational database", topic: "Concepts", definition: "Database with tables linked via relationships." },
      { term: "Entity", topic: "Modelling", definition: "Object or thing represented in a database." },
      { term: "Attribute", topic: "Modelling", definition: "Property describing an entity." },
      { term: "Relationship", topic: "Modelling", definition: "Association between entities." },
      { term: "ERD", topic: "Modelling", definition: "Entity-relationship diagram showing schema." },
      { term: "Referential integrity", topic: "Integrity", definition: "Ensuring foreign keys reference existing records." },
      { term: "Normalisation", topic: "Integrity", definition: "Process of designing tables to reduce redundancy." },
      { term: "1NF", topic: "Integrity", definition: "First normal form: atomic values and unique rows.", example: "Split multiple phone numbers into separate rows." },
      { term: "SQL", topic: "SQL", definition: "Structured Query Language for managing data." },
      { term: "SELECT", topic: "SQL", definition: "Statement to retrieve data from tables." },
      { term: "FROM", topic: "SQL", definition: "Clause specifying the source table." },
      { term: "WHERE", topic: "SQL", definition: "Clause filtering rows by conditions.", example: "SELECT * FROM Students WHERE Age > 15;" },
      { term: "ORDER BY", topic: "SQL", definition: "Clause sorting results." },
      { term: "GROUP BY", topic: "SQL", definition: "Clause grouping rows for aggregation." },
      { term: "JOIN", topic: "SQL", definition: "Combining rows from related tables.", example: "SELECT * FROM A JOIN B ON A.id = B.a_id;" }
    ]
  },
  {
    id: "apl-10",
    number: 10,
    title: "Boolean logic",
    group: "Algorithms, programming and logic",
    description: "Logic gates, truth tables and Boolean algebra.",
    terms: [
      { term: "Boolean", topic: "Logic", definition: "Data type with only two values: true/false." },
      { term: "Logic gate", topic: "Logic", definition: "Electronic component performing Boolean operations." },
      { term: "AND gate", topic: "Logic", definition: "Outputs true only if all inputs are true." },
      { term: "OR gate", topic: "Logic", definition: "Outputs true if any input is true." },
      { term: "NOT gate", topic: "Logic", definition: "Inverts the input value." },
      { term: "NAND gate", topic: "Logic", definition: "Outputs false only if all inputs are true." },
      { term: "NOR gate", topic: "Logic", definition: "Outputs true only if all inputs are false." },
      { term: "XOR gate", topic: "Logic", definition: "Outputs true if inputs are different." },
      { term: "XNOR gate", topic: "Logic", definition: "Outputs true if inputs are the same." },
      { term: "Truth table", topic: "Logic", definition: "Table listing outputs for all input combinations." },
      { term: "Boolean expression", topic: "Logic", definition: "Algebraic formula using Boolean variables and operators." },
      { term: "De Morgan’s laws", topic: "Logic", definition: "Rules for negating compound Boolean expressions." },
      { term: "Simplification", topic: "Logic", definition: "Reducing expressions to simpler equivalent forms." }
    ]
  }
];

const qaData = {
  "cs-1": {
    "Numbers": [
      {
        question: "Explain why overflow occurs in 8-bit unsigned binary addition. Give an example.",
        answer: "In 8-bit unsigned binary, the largest value is 255. If the result exceeds 255, the most significant bit is discarded, causing wrap-around. Example: 11111111₂ (255) + 00000001₂ (1) → 00000000₂ with carry out.",
        paper: "2023 May/June Paper 11",
        topic: "Numbers",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Text": [
      {
        question: "Describe a difference between ASCII and Unicode and why Unicode is needed.",
        answer: "ASCII uses 7/8 bits and covers a limited set of characters, mainly Latin. Unicode assigns code points to characters from many languages and symbols, supporting internationalization and emojis.",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Text",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Images": [
      {
        question: "Define colour depth and explain its effect on image file size.",
        answer: "Colour depth is the number of bits per pixel. Higher colour depth increases the number of representable colours and increases file size because more bits are stored per pixel.",
        paper: "2025 Feb/Mar Paper 13",
        topic: "Images",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Sound": [
      {
        question: "State how sample rate and resolution affect sound quality and file size.",
        answer: "Higher sample rate captures more frequent samples, and higher resolution stores each sample with more precision. Both increase sound fidelity and file size due to more data per second.",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Sound",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Compression": [
      {
        question: "Compare lossless and lossy compression with a suitable use case for each.",
        answer: "Lossless preserves all data, suitable for text or source code where exact recovery is essential. Lossy removes some data, suitable for images/audio where small quality loss is acceptable to reduce size.",
        paper: "2024 May/June Paper 21",
        topic: "Compression",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      },
      {
        question: "Explain RLE and when it is effective.",
        answer: "Run-length encoding stores consecutive repeated values as count-value pairs (e.g., AAAA → 4A). It is effective when data has long runs of repeated values, such as simple graphics; not effective for random data.",
        paper: "2025 Oct/Nov Paper 12",
        topic: "Compression",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ]
  },
  "cs-2": {
    "Modes": [
      {
        question: "Differentiate synchronous and asynchronous transmission.",
        answer: "Synchronous uses a shared clock to align bits, efficient for continuous streams. Asynchronous adds start/stop bits and does not rely on shared clock, suitable for intermittent transmission.",
        paper: "2023 May/June Paper 13",
        topic: "Modes",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Errors": [
      {
        question: "Describe parity bits and a limitation of parity checking.",
        answer: "Parity adds a bit to make the number of 1s even or odd. Limitation: it detects single-bit errors but not all multi-bit errors (e.g., two-bit flips retain parity).",
        paper: "2024 Oct/Nov Paper 23",
        topic: "Errors",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ],
    "Protocols": [
      {
        question: "Explain handshaking and why it is used in network communication.",
        answer: "Handshaking is the negotiation process where devices agree on parameters (speed, protocol features) before data transfer, ensuring compatibility and reliable communication.",
        paper: "2025 May/June Paper 12",
        topic: "Protocols",
        source: "PastPapers.Co",
        link: "https://pastpapers.co/cie/?dir=IGCSE%2FComputer-Science-0478"
      }
    ]
  }
};

function groupUnits() {
  const groups = {};
  units.forEach(u => {
    if (!groups[u.group]) groups[u.group] = [];
    groups[u.group].push(u);
  });
  return groups;
}

function renderSidebar(activeId) {
  const nav = document.getElementById("units-nav");
  nav.innerHTML = "";
  const groups = groupUnits();
  Object.keys(groups).forEach(cat => {
    const g = document.createElement("div");
    g.className = "group";
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = cat;
    g.appendChild(title);
    groups[cat].forEach(u => {
      const a = document.createElement("a");
      a.href = `#${u.id}`;
      a.className = "unit-item" + (u.id === activeId ? " active" : "");
      const num = document.createElement("div");
      num.className = "unit-number";
      num.textContent = u.number;
      const label = document.createElement("div");
      label.textContent = u.title;
      a.appendChild(num);
      a.appendChild(label);
      g.appendChild(a);
    });
    nav.appendChild(g);
  });
  // Populate topics for active unit
  const topicsNav = document.getElementById("topics-nav");
  topicsNav.innerHTML = "";
  const activeUnit = units.find(u => u.id === activeId) || units[0];
  const topicsSet = new Set();
  activeUnit.terms.forEach(t => topicsSet.add(t.topic));
  const topics = Array.from(topicsSet).sort();
  if (topics.length) {
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = "Topics";
    topicsNav.appendChild(title);
    topics.forEach(tp => {
      const a = document.createElement("a");
      a.href = "#";
      a.className = "topic-item" + (state.topic === tp ? " active" : "");
      a.setAttribute("data-topic", tp);
      a.textContent = tp;
      topicsNav.appendChild(a);
    });
  }
}

let state = {
  activeUnitId: null,
  scope: "current",
  search: "",
  topic: "",
  letter: "",
  confusionsOnly: false,
  mode: "list",
  flash: { index: 0, order: [] }
};

function getActiveUnit() {
  return units.find(u => u.id === state.activeUnitId) || units[0];
}

function buildLetterFilter() {
  const el = document.getElementById("letter-filter");
  el.innerHTML = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const allChip = document.createElement("button");
  allChip.className = "letter-chip" + (state.letter === "" ? " active" : "");
  allChip.textContent = "All";
  allChip.addEventListener("click", () => {
    state.letter = "";
    renderTerms();
  });
  el.appendChild(allChip);
  letters.forEach(L => {
    const chip = document.createElement("button");
    chip.className = "letter-chip" + (state.letter === L ? " active" : "");
    chip.textContent = L;
    chip.addEventListener("click", () => {
      state.letter = L;
      renderTerms();
    });
    el.appendChild(chip);
  });
}

function getScopeUnits() {
  return state.scope === "all" ? units : [getActiveUnit()];
}

function collectTopics() {
  const set = new Set();
  getScopeUnits().forEach(u => u.terms.forEach(t => set.add(t.topic)));
  return Array.from(set).sort();
}

function populateTopicSelect() {
  const sel = document.getElementById("topic-select");
  const current = state.topic;
  sel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All Topics";
  sel.appendChild(optAll);
  collectTopics().forEach(topic => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    sel.appendChild(opt);
  });
  sel.value = current;
}

function computeFilteredTerms() {
  const q = state.search.trim().toLowerCase();
  const letter = state.letter;
  const topic = state.topic;
  const list = [];
  getScopeUnits().forEach(u => {
    u.terms.forEach(t => {
      const matchesQuery = q === "" || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q);
      const matchesLetter = letter === "" || t.term[0].toUpperCase() === letter;
      const matchesTopic = topic === "" || t.topic === topic;
      const matchesConfusions = !state.confusionsOnly || (!!t.misconception || !!t.contrast);
      if (matchesQuery && matchesLetter && matchesTopic) {
        if (matchesConfusions) list.push({ unit: u, term: t });
      }
    });
  });
  return list;
}

function clearTerms() {
  const termsEl = document.getElementById("terms");
  termsEl.innerHTML = "";
}

function renderHeader() {
  const unit = getActiveUnit();
  const titleEl = document.getElementById("unit-title");
  const descEl = document.getElementById("unit-desc");
  if (state.scope === "all") {
    titleEl.textContent = "All Units · Key Terms";
    descEl.textContent = "Filtered across all units and topics.";
  } else {
    titleEl.textContent = `Unit ${unit.number} · ${unit.title}`;
    descEl.textContent = unit.description;
  }
}

function renderTermsLazy(items) {
  const container = document.getElementById("terms");
  const batchSize = 36;
  let cursor = 0;
  container.innerHTML = "";
  const sentinel = document.createElement("div");
  sentinel.style.height = "1px";
  container.appendChild(sentinel);
  function renderBatch() {
    const end = Math.min(cursor + batchSize, items.length);
    for (let i = cursor; i < end; i++) {
      const { unit, term } = items[i];
      const card = document.createElement("div");
      card.className = "term-card";
      const h = document.createElement("h3");
      h.className = "term-title";
      h.textContent = term.term;
      const p = document.createElement("p");
      p.className = "term-def";
      p.textContent = term.definition;
      card.appendChild(h);
      card.appendChild(p);
      if (state.scope === "all") {
        const meta = document.createElement("p");
        meta.className = "muted";
        const topicChip = document.createElement("button");
        topicChip.className = "chip";
        topicChip.textContent = term.topic;
        topicChip.setAttribute("data-topic", term.topic);
        meta.textContent = `Unit ${unit.number} · ${unit.title} · `;
        meta.appendChild(topicChip);
        card.appendChild(meta);
      } else {
        const meta = document.createElement("p");
        meta.className = "muted";
        const topicChip = document.createElement("button");
        topicChip.className = "chip";
        topicChip.textContent = term.topic;
        topicChip.setAttribute("data-topic", term.topic);
        meta.appendChild(topicChip);
        card.appendChild(meta);
      }
      const addDetail = (label, value) => {
        if (!value) return;
        const d = document.createElement("p");
        d.className = "detail";
        const l = document.createElement("span");
        l.className = "detail-label";
        l.textContent = label + ": ";
        d.appendChild(l);
        if (label === "Contrast" && typeof value === "string" && value.includes("vs")) {
          const parts = value.split("vs").map(s => s.trim());
          parts.forEach(part => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = part;
            chip.setAttribute("data-search", part);
            d.appendChild(chip);
          });
        } else {
          const t = document.createElement("span");
          t.textContent = value;
          d.appendChild(t);
        }
        card.appendChild(d);
      };
      addDetail("Example", term.example);
      addDetail("Misconception", term.misconception);
      addDetail("Contrast", term.contrast);
      container.insertBefore(card, sentinel);
    }
    cursor = end;
  }
  renderBatch();
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (cursor < items.length) {
          // Use idle callback when available for smoother loading
          const run = () => renderBatch();
          if ("requestIdleCallback" in window) {
            requestIdleCallback(run, { timeout: 200 });
          } else {
            setTimeout(run, 0);
          }
        } else {
          io.disconnect();
          sentinel.remove();
        }
      }
    });
  });
  io.observe(sentinel);
}

function renderTerms() {
  const termsSection = document.getElementById("terms");
  const flashSection = document.getElementById("flashcards");
  termsSection.style.display = "";
  flashSection.classList.add("hidden");
  renderHeader();
  populateTopicSelect();
  const items = computeFilteredTerms();
  renderTermsLazy(items);
}

function renderFlashcards() {
  const termsSection = document.getElementById("terms");
  const flashSection = document.getElementById("flashcards");
  termsSection.style.display = "none";
  flashSection.classList.remove("hidden");
  renderHeader();
  populateTopicSelect();
  const items = computeFilteredTerms();
  if (items.length === 0) {
    document.getElementById("flash-front").textContent = "No cards match filters.";
    const back = document.getElementById("flash-back");
    back.textContent = "";
    back.classList.remove("show");
    return;
  }
  if (!state.flash.order.length || state.flash.order.length !== items.length) {
    state.flash.order = items.map((_, i) => i);
    state.flash.index = 0;
  }
  const idx = state.flash.order[state.flash.index];
  const { unit, term } = items[idx];
  document.getElementById("flash-front").textContent = term.term;
  const back = document.getElementById("flash-back");
  back.textContent = `${term.definition} ${state.scope === "all" ? `(Unit ${unit.number} · ${unit.title} · ${term.topic})` : `(${term.topic})`}`;
  back.classList.remove("show");
}

function renderView() {
  if (state.mode === "flashcards") {
    renderFlashcards();
  } else if (state.mode === "qa") {
    renderQA();
  } else {
    // confusions-only view is handled by state.confusionsOnly flag
    renderTerms();
  }
}

function handleHashChange() {
  const id = location.hash.replace("#", "") || units[0].id;
  state.activeUnitId = id;
  renderSidebar(id);
  renderView();
}

function setupToggle() {
  const btn = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
  window.addEventListener("hashchange", () => {
    sidebar.classList.remove("open");
  });
}

function setupFilters() {
  const searchInput = document.getElementById("search-input");
  const scopeSelect = document.getElementById("scope-select");
  const topicSelect = document.getElementById("topic-select");
  const confusionsOnly = document.getElementById("confusions-only");
  const modeSelect = document.getElementById("mode-select");
  searchInput.addEventListener("input", e => {
    state.search = e.target.value;
    renderView();
  });
  scopeSelect.addEventListener("change", e => {
    state.scope = e.target.value;
    buildLetterFilter();
    renderView();
  });
  topicSelect.addEventListener("change", e => {
    state.topic = e.target.value;
    renderView();
  });
  confusionsOnly.addEventListener("change", e => {
    state.confusionsOnly = e.target.checked;
    renderView();
  });
  modeSelect.addEventListener("change", e => {
    const val = e.target.value;
    if (val === "flashcards") {
      state.mode = "flashcards";
      state.confusionsOnly = false;
    } else if (val === "qa") {
      state.mode = "qa";
      state.confusionsOnly = false;
    } else {
      state.mode = "list";
      state.confusionsOnly = val === "confusions";
    }
    // sync checkbox state to mode
    document.getElementById("confusions-only").checked = state.confusionsOnly;
    renderView();
  });
  buildLetterFilter();
}

function computeFilteredQAs() {
  const q = state.search.trim().toLowerCase();
  const topic = state.topic;
  const list = [];
  const unitsScope = state.scope === "all" ? units.map(u => u.id) : [state.activeUnitId];
  unitsScope.forEach(uid => {
    const unit = units.find(u => u.id === uid);
    const qaByTopic = qaData[uid] || {};
    Object.keys(qaByTopic).forEach(tp => {
      qaByTopic[tp].forEach(item => {
        const matchesTopic = topic === "" || tp === topic;
        const matchesQuery = q === "" || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q) || tp.toLowerCase().includes(q);
        if (matchesTopic && matchesQuery) {
          list.push({ unit, topic: tp, item });
        }
      });
    });
  });
  return list;
}

function renderQA() {
  const termsSection = document.getElementById("terms");
  const flashSection = document.getElementById("flashcards");
  const qaSection = document.getElementById("qa");
  termsSection.style.display = "none";
  flashSection.classList.add("hidden");
  qaSection.classList.remove("hidden");
  renderHeader();
  populateTopicSelect();
  const items = computeFilteredQAs();
  qaSection.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "qa-card";
    const msg = document.createElement("p");
    msg.className = "muted";
    msg.textContent = "No Q&A matches filters.";
    empty.appendChild(msg);
    qaSection.appendChild(empty);
    return;
  }
  items.forEach(({ unit, topic, item }) => {
    const card = document.createElement("div");
    card.className = "qa-card";
    const h = document.createElement("h3");
    h.className = "qa-question";
    h.textContent = item.question;
    const meta = document.createElement("p");
    meta.className = "qa-meta";
    meta.textContent = `Unit ${unit.number} · ${unit.title} · ${topic} · ${item.paper}`;
    const ans = document.createElement("p");
    ans.className = "qa-answer";
    ans.textContent = item.answer;
    const actions = document.createElement("div");
    actions.className = "qa-actions";
    const reveal = document.createElement("button");
    reveal.textContent = "Reveal";
    reveal.addEventListener("click", () => {
      ans.classList.toggle("show");
    });
    const source = document.createElement("a");
    source.className = "chip";
    source.href = item.link;
    source.target = "_blank";
    source.rel = "noopener";
    source.textContent = item.source;
    actions.appendChild(reveal);
    actions.appendChild(source);
    card.appendChild(h);
    card.appendChild(meta);
    card.appendChild(ans);
    card.appendChild(actions);
    qaSection.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  handleHashChange();
  setupToggle();
  setupFilters();
  document.getElementById("flash-prev").addEventListener("click", () => {
    if (!state.flash.order.length) return;
    state.flash.index = (state.flash.index - 1 + state.flash.order.length) % state.flash.order.length;
    renderFlashcards();
  });
  document.getElementById("flash-next").addEventListener("click", () => {
    if (!state.flash.order.length) return;
    state.flash.index = (state.flash.index + 1) % state.flash.order.length;
    renderFlashcards();
  });
  document.getElementById("flash-reveal").addEventListener("click", () => {
    const back = document.getElementById("flash-back");
    back.classList.toggle("show");
  });
  document.getElementById("flash-shuffle").addEventListener("click", () => {
    const items = computeFilteredTerms();
    state.flash.order = items.map((_, i) => i).sort(() => Math.random() - 0.5);
    state.flash.index = 0;
    renderFlashcards();
  });
});

document.getElementById("units-nav").addEventListener("click", (e) => {
  const a = e.target.closest("a.unit-item");
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute("href").replace("#", "");
  if (id !== state.activeUnitId) {
    location.hash = "#" + id;
    handleHashChange();
  }
});

document.getElementById("topics-nav").addEventListener("click", (e) => {
  const a = e.target.closest("a.topic-item");
  if (!a) return;
  e.preventDefault();
  const tp = a.getAttribute("data-topic");
  state.topic = tp;
  const sel = document.getElementById("topic-select");
  if (sel) sel.value = tp;
  renderView();
  const target = document.getElementById(state.mode === "qa" ? "qa" : "terms");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("terms").addEventListener("click", (e) => {
  const topicChip = e.target.closest("[data-topic]");
  const searchChip = e.target.closest("[data-search]");
  if (topicChip) {
    state.topic = topicChip.getAttribute("data-topic");
    document.getElementById("topic-select").value = state.topic;
    renderTerms();
  } else if (searchChip) {
    const value = searchChip.getAttribute("data-search");
    state.search = value;
    document.getElementById("search-input").value = value;
    renderTerms();
  }
});
