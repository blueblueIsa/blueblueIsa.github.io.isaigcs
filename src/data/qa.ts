import type { QAData, Question } from '../types';
import { loadQAFromPapers } from './importer';

const baseQaData: QAData = {
  "cs-1": {
    "Numbers": [
      {
        question: "Explain why overflow occurs in 8-bit unsigned binary addition. Give an example.",
        answer: "Any three from:\nIn 8-bit unsigned binary, the largest value is 255\nThe result of the addition exceeds 255\nThe most significant bit (carry bit) is discarded\n... causing wrap-around\nExample: 11111111₂ (255) + 00000001₂ (1) → 00000000₂",
        paper: "2023 May/June Paper 11",
        topic: "Numbers",
        tags: ["explain"],
        marks: 3,
        keywords: ["overflow", "8-bit", "binary addition"]
      },
      {
        question: "Convert 11010110₂ to denary and hexadecimal.",
        answer: "Denary: 214\nHexadecimal: D6",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Numbers",
        tags: ["calculate"],
        marks: 3,
        keywords: ["convert", "binary", "hexadecimal", "denary"]
      },
      {
        question: "Give two reasons why ticket numbers are displayed as hexadecimal.",
        answer: "1. Shorter representation than binary\n2. Easier for humans to read",
        paper: "2025 May/June Paper 11",
        topic: "Numbers",
        tags: ["give reasons"],
        marks: 2,
        keywords: ["hexadecimal", "advantages", "display", "binary"]
      },
      {
        question: "Identify incorrect statement about hexadecimal number system.",
        answer: "It is a base 10 system",
        paper: "S24P11",
        topic: "Numbers",
        tags: ["multiple-choice"],
        marks: 1,
        keywords: ["hexadecimal", "incorrect statement", "base 10", "base 16"]
      },
      {
        question: "Convert denary numbers 20, 32, and 165 to hexadecimal.",
        answer: "14\n20\nA5",
        paper: "S24P11",
        topic: "Numbers",
        tags: ["conversion"],
        marks: 3,
        keywords: ["denary to hexadecimal", "conversion"]
      },
      {
        question: "Perform logical left shift of 3 places on binary number 10100011.",
        answer: "00011000",
        paper: "S24P11",
        topic: "Numbers",
        tags: ["logical shift"],
        marks: 1,
        keywords: ["logical left shift", "binary shift"]
      },
      {
        question: "Identify correct statement about logical left shift of 2 places.",
        answer: "It would multiply the binary number by 4",
        paper: "2024 May/June Paper 11",
        topic: "Numbers",
        tags: ["multiple-choice"],
        marks: 1,
        keywords: ["logical left shift", "effect", "multiplication"]
      },
      {
        question: "Convert two's complement 10100011 to denary.",
        answer: "-93",
        paper: "2024 May/June Paper 11",
        topic: "Numbers",
        tags: ["two's complement"],
        marks: 2,
        keywords: ["two's complement", "conversion"]
      }
    ],
    "Text": [
      {
        question: "Describe a difference between ASCII and Unicode and why Unicode is needed.",
        answer: "Difference:\nASCII uses 7 or 8 bits (per character)\nUnicode uses 16 or 32 bits (per character)\n\nReason:\nASCII has a limited character set (Latin only)\nUnicode covers all major languages/symbols (internationalization)",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Text",
        tags: ["compare", "explain"],
        marks: 3,
        keywords: ["ASCII", "Unicode", "code points", "character set"]
      },
      {
        question: "Explain why extended ASCII is insufficient for representing some languages.",
        answer: "Extended ASCII provides 256 codes\n... which is insufficient for languages with many characters (e.g., Chinese/Japanese)\nUnicode supports thousands of code points",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Text",
        tags: ["explain"],
        marks: 2,
        keywords: ["extended ASCII", "Unicode", "languages"]
      }
    ],
    "Images": [
      {
        question: "Define colour depth and explain its effect on image file size.",
        answer: "Colour depth is the number of bits used to represent each pixel\nGreater colour depth allows more colours to be represented\n... which increases the file size\n... as more bits are needed for each pixel",
        paper: "2025 Feb/Mar Paper 13",
        topic: "Images",
        tags: ["define", "explain"],
        marks: 3,
        keywords: ["colour depth", "bits per pixel", "file size"]
      },
      {
        question: "Calculate the file size of a 400×300 image with 16-bit colour depth, uncompressed.",
        answer: "Pixels: 400 × 300 = 120,000\nBits: 120,000 × 16 = 1,920,000 bits\nBytes: 1,920,000 / 8 = 240,000 bytes\n(≈ 234.4 KB)",
        paper: "2024 May/June Paper 21",
        topic: "Images",
        tags: ["calculate"],
        marks: 4,
        keywords: ["file size", "image", "colour depth", "resolution"]
      }
    ],
    "Sound": [
      {
        question: "State how sample rate and resolution affect sound quality and file size.",
        answer: "Sample rate: Number of samples taken per second\nHigher sample rate improves sound accuracy/quality\n... but increases file size\n\nResolution: Number of bits per sample\nHigher resolution improves dynamic range/quality\n... but increases file size",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Sound",
        tags: ["describe"],
        marks: 3,
        keywords: ["sample rate", "resolution", "file size"]
      },
      {
        question: "Calculate the file size of a 30-second mono audio clip, 44.1 kHz sample rate, 16-bit resolution, uncompressed.",
        answer: "Samples: 44,100 × 30 = 1,323,000\nTotal bits: 1,323,000 × 16 = 21,168,000 bits\nBytes: 21,168,000 / 8 = 2,646,000 bytes\n(≈ 2.52 MB)",
        paper: "2025 Oct/Nov Paper 12",
        topic: "Sound",
        tags: ["calculate"],
        marks: 4,
        keywords: ["audio", "file size", "sample rate", "resolution"]
      }
    ],
    "Compression": [
      {
        question: "Compare lossless and lossy compression with a suitable use case for each.",
        answer: "Lossless:\nNo data is lost/original file can be recreated perfectly\nUse: Text files/Source code/Spreadsheets\n\nLossy:\nSome data is permanently removed/discarded (to reduce size)\nUse: Images (JPEG)/Audio (MP3)/Video",
        paper: "2024 May/June Paper 21",
        topic: "Compression",
        tags: ["compare"],
        marks: 4,
        keywords: ["lossless", "lossy", "use case"]
      },
      {
        question: "Explain RLE and when it is effective.",
        answer: "Run-length encoding stores consecutive identical values as a count and the value\nExample: AAAAA becomes 5A\nEffective for data with long runs of repeated values (e.g., simple graphics)\nNot effective for random data",
        paper: "2025 Oct/Nov Paper 12",
        topic: "Compression",
        tags: ["explain"],
        marks: 3,
        keywords: ["RLE", "runs", "graphics"]
      },
      {
        question: "Describe what a dictionary-based compression method does in general terms.",
        answer: "Builds a dictionary/index of frequent patterns/words\nReplaces instances of patterns with short references/tokens to the dictionary",
        paper: "2023 May/June Paper 13",
        topic: "Compression",
        tags: ["describe"],
        marks: 3,
        keywords: ["dictionary", "compression", "patterns"]
      }
    ]
  },
  "cs-2": {
    "Modes": [
      {
        question: "Serial data transmission is used to transmit the data packets across the network.\nExplain why serial data transmission is used to transmit the data packets.",
        answer: "Any three from:\nThe network may be spread over a long distance ...\n... so it is more reliable\nBits will be sent/arrive in sequence\n...so bits less likely to be skewed\nLess crosstalk/interference\n... so less likely to have errors\nThe data may not need to be transmitted at a fast speed // data transmission speed of serial is adequate\nThe cables in the network only use serial transmission",
        paper: "2024 May/June Paper 11",
        topic: "Modes",
        tags: ["explain"],
        marks: 3,
        keywords: ["serial", "parallel", "transmission", "reliability", "skew", "interference"]
      },
      {
        question: "Tick (✓) one box to show which of the terms is not a method for transmitting data.\nA serial\nB simplex\nC parallel\nD parity",
        answer: "D parity",
        paper: "2024 May/June Paper 12",
        topic: "Modes",
        tags: ["identify"],
        marks: 1,
        keywords: ["transmission method", "parity", "serial", "simplex", "parallel"]
      },
      {
        question: "Explain the difference between simplex, half-duplex and full-duplex data transmission.",
        answer: "Simplex:\nData flows in one direction only\nExample: Keyboard to CPU\n\nHalf-duplex:\nData flows in both directions but not at the same time\nExample: Walkie-talkie\n\nFull-duplex:\nData flows in both directions simultaneously\nExample: Telephone call",
        paper: "2023 May/June Paper 11",
        topic: "Modes",
        tags: ["compare", "explain"],
        marks: 6,
        keywords: ["simplex", "half-duplex", "full-duplex", "direction"]
      },
      {
        question: "Describe how a USB connection works when a device is plugged in.",
        answer: "Any three from:\nThe computer detects the device automatically\n... due to a change in voltage on the data lines\nThe device is automatically recognised\n... and the appropriate driver software is loaded\nIf no driver is found, the user is prompted to install one",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Modes",
        tags: ["describe"],
        marks: 3,
        keywords: ["USB", "driver", "plug and play", "detection"]
      }
    ],
    "Packets": [
      {
        question: "Describe the structure of a data packet.",
        answer: "Any three from:\nA packet is split into three different sections\n... the header\n... the payload\n... the trailer",
        paper: "2024 May/June Paper 11",
        topic: "Packets",
        tags: ["describe"],
        marks: 3,
        keywords: ["packet", "structure", "header", "payload", "trailer"]
      },
      {
        question: "Data is broken down into smaller units to be transmitted from one device to another.\nGive the name of the unit that data is broken down into.",
        answer: "Packet",
        paper: "2024 May/June Paper 12",
        topic: "Packets",
        tags: ["identify"],
        marks: 1,
        keywords: ["packet", "data unit"]
      }
    ],
    "Switching": [
      {
        question: "Packet switching is used to transmit the data packets across the network.\nIdentify the device that controls which path is taken by each data packet.",
        answer: "Router",
        paper: "2024 May/June Paper 11",
        topic: "Switching",
        tags: ["identify"],
        marks: 1,
        keywords: ["router", "packet switching", "path"]
      }
    ],
    "Encryption": [
      {
        question: "Explain the difference between symmetric and asymmetric encryption.",
        answer: "Symmetric encryption uses the same key for both encryption and decryption\nAsymmetric encryption uses a public key for encryption\n... and a private key for decryption (or vice versa)",
        paper: "2023 May/June Paper 12",
        topic: "Encryption",
        tags: ["compare", "explain"],
        marks: 4,
        keywords: ["symmetric", "asymmetric", "encryption", "public key", "private key"]
      },
      {
        question: "State one benefit of using symmetric encryption over asymmetric encryption.",
        answer: "Symmetric encryption is faster/more efficient to calculate than asymmetric encryption",
        paper: "2024 Oct/Nov Paper 11",
        topic: "Encryption",
        tags: ["state"],
        marks: 1,
        keywords: ["symmetric", "speed", "efficiency"]
      }
    ],
    "Errors": [
      {
        question: "Describe how an Automatic Repeat Request (ARQ) system is used to check for errors.",
        answer: "Any four from:\nThe sender transmits a data packet\n... and waits for an acknowledgement (ACK)\nIf no ACK is received within a timeout period\n... or if a negative acknowledgement (NACK) is received\nThe sender retransmits the packet\nThis process repeats until an ACK is received or a limit is reached",
        paper: "2024 May/June Paper 11",
        topic: "Errors",
        tags: ["describe"],
        marks: 4,
        keywords: ["ARQ", "ACK", "NACK", "timeout", "retransmit", "packet"]
      },
      {
        question: "Explain how a check digit is used to check for data entry errors.",
        answer: "A calculation is performed on the data to generate a digit\nThis digit is appended to the data\nWhen data is entered, the calculation is performed again\nIf the calculated digit matches the entered check digit, the data is likely correct",
        paper: "2023 Oct/Nov Paper 12",
        topic: "Errors",
        tags: ["explain"],
        marks: 3,
        keywords: ["check digit", "calculation", "validation"]
      },
      {
        question: "Describe parity bits and a limitation of parity checking.",
        answer: "Parity adds a bit to make the number of 1s even or odd\nLimitation: it detects single-bit errors\n... but not all multi-bit errors (e.g., two-bit flips retain parity)",
        paper: "2024 Oct/Nov Paper 23",
        topic: "Errors",
        tags: ["describe", "explain"],
        marks: 3,
        keywords: ["parity", "error detection", "limitation"]
      },
      {
        question: "Explain what a checksum is and how it is used.",
        answer: "A checksum is a value computed from the data\nThe sender transmits it with the packet\nThe receiver recomputes the checksum\n... and compares it to the received checksum to detect errors",
        paper: "2025 May/June Paper 12",
        topic: "Errors",
        tags: ["explain"],
        marks: 3,
        keywords: ["checksum", "error detection"]
      }
    ]
  },
  "cs-3": {
    "Architecture": [
      {
        question: "Name the three buses in Von Neumann architecture and state their roles.",
        answer: "Data bus carries data; Address bus carries memory addresses; Control bus carries control signals.",
        paper: "2023 May/June Paper 11",
        topic: "Architecture",
        tags: ["state", "explain"],
        marks: 3,
        keywords: ["data bus", "address bus", "control bus", "von neumann"]
      },
      {
        question: "Explain the function of the ALU and Control Unit in a CPU.",
        answer: "The ALU performs arithmetic and logic operations; the Control Unit fetches, decodes and coordinates execution of instructions.",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Architecture",
        tags: ["explain"],
        marks: 3,
        keywords: ["ALU", "control unit", "CPU", "fetch-decode-execute"]
      },
      {
        question: "Describe the stored program concept.",
        answer: "Instructions and data are stored in the same memory unit\n... and are accessed via the same buses.",
        paper: "2023 May/June Paper 12",
        topic: "Architecture",
        tags: ["describe"],
        marks: 2,
        keywords: ["stored program", "memory", "instructions", "data"]
      },
      {
        question: "Describe the steps of the Fetch-Execute cycle.",
        answer: "Any four from:\nThe PC holds the address of the next instruction\nThe address is copied to the MAR\nThe address is sent along the address bus\nThe instruction is fetched from that address in memory\n... and transferred to the MDR\nThe instruction is sent to the CIR\nThe PC is incremented\nThe instruction is decoded and executed",
        paper: "2024 May/June Paper 11",
        topic: "Architecture",
        tags: ["describe"],
        marks: 4,
        keywords: ["fetch-execute", "PC", "MAR", "MDR", "CIR"]
      },
      {
        question: "Explain how clock speed and cache size affect CPU performance.",
        answer: "Clock speed: Higher speed means more cycles per second, so more instructions can be processed.\nCache size: Larger cache stores more frequently used instructions/data closer to the CPU, reducing access time compared to RAM.",
        paper: "2025 Feb/Mar Paper 12",
        topic: "Architecture",
        tags: ["explain"],
        marks: 4,
        keywords: ["clock speed", "cache", "performance", "CPU"]
      }
    ],
    "Memory": [
      {
        question: "Compare RAM and ROM with one use case for each.",
        answer: "RAM is volatile working memory used during program execution. ROM is non-volatile and stores firmware that runs at start-up.",
        paper: "2025 Feb/Mar Paper 13",
        topic: "Memory",
        tags: ["compare"],
        marks: 4,
        keywords: ["RAM", "ROM", "volatile", "firmware"]
      },
      {
        question: "Explain the purpose of Virtual Memory.",
        answer: "Any three from:\nIt is used when RAM is full\nData not currently in use is moved from RAM to secondary storage (HDD/SSD)\n... creating 'pages'\nIt extends the available memory for running programs\nData is swapped back to RAM when needed",
        paper: "2024 May/June Paper 12",
        topic: "Memory",
        tags: ["explain"],
        marks: 3,
        keywords: ["virtual memory", "paging", "RAM", "secondary storage"]
      }
    ],
    "Storage": [
      {
        question: "State one advantage and one disadvantage of SSD compared to HDD.",
        answer: "Advantage: faster access and no moving parts. Disadvantage: typically higher cost per GB.",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Storage",
        tags: ["compare", "state"],
        marks: 2,
        keywords: ["SSD", "HDD", "speed", "cost"]
      },
      {
        question: "Describe how data is written to and read from optical storage.",
        answer: "Any three from:\nA laser beam is used to read/write data\nData is stored as pits and lands\n... on a spiral track\nWhen reading, the laser is reflected differently by pits and lands\n... which is interpreted as binary 1s and 0s",
        paper: "2023 May/June Paper 13",
        topic: "Storage",
        tags: ["describe"],
        marks: 3,
        keywords: ["optical", "laser", "pits", "lands", "binary"]
      },
      {
        question: "Identify one storage device built into a portable tablet computer.",
        answer: "SSD // Solid-state drive // Solid-state (device)",
        paper: "S24P11",
        topic: "Storage",
        tags: ["identify"],
        marks: 1,
        keywords: ["storage device", "tablet", "SSD", "solid-state"]
      }
    ],
    "I/O": [
      {
        question: "Give one example each of an input device, output device and sensor.",
        answer: "Input: keyboard; Output: monitor; Sensor: temperature sensor.",
        paper: "2024 May/June Paper 21",
        topic: "I/O",
        tags: ["state"],
        marks: 3,
        keywords: ["input", "output", "sensor", "devices"]
      },
      {
        question: "A greenhouse system controls temperature automatically. Describe how the system uses sensors and actuators to maintain temperature.",
        answer: "Any four from:\nThe temperature sensor constantly measures the temperature\nIt sends analogue data to the ADC\n... which converts it to digital data for the microprocessor\nThe microprocessor compares the reading to a pre-set value\nIf temperature < pre-set value, it signals the actuator\n... to turn on the heater\nIf temperature > pre-set value, it signals the actuator to turn off the heater/open windows",
        paper: "2024 Oct/Nov Paper 12",
        topic: "I/O",
        tags: ["describe", "application"],
        marks: 4,
        keywords: ["sensor", "microprocessor", "actuator", "ADC", "control loop"]
      },
      {
        question: "Explain how a 3D printer creates a solid object.",
        answer: "Any three from:\nThe object is designed in CAD software\nThe design is sliced into layers\nThe printer builds the object layer by layer\n... using a material (e.g., plastic filament) that is heated and extruded through a nozzle\nEach layer hardens/cools before the next is added",
        paper: "2023 May/June Paper 11",
        topic: "I/O",
        tags: ["explain"],
        marks: 3,
        keywords: ["3D printer", "layers", "CAD", "additive manufacturing"]
      },
      {
        question: "Identify two input devices built into a portable tablet computer.",
        answer: "Any two from:\n• Touch screen\n• Microphone\n• Button\n• Webcam // (digital) camera\n• Accelerometer\n• Biometric device",
        paper: "S24P11",
        topic: "I/O",
        tags: ["identify"],
        marks: 2,
        keywords: ["input devices", "tablet", "touch screen", "microphone"]
      },
      {
        question: "Identify one output device built into a portable tablet computer.",
        answer: "Any one from:\n• Screen\n• Speaker\n• LED",
        paper: "S24P11",
        topic: "I/O",
        tags: ["identify"],
        marks: 1,
        keywords: ["output device", "tablet", "screen", "display"]
      }
    ],
    "Systems": [
      {
        question: "Define embedded system and give an example.",
        answer: "An embedded system is dedicated to a specific function within a larger system, e.g., a washing machine controller.",
        paper: "2025 Oct/Nov Paper 12",
        topic: "Systems",
        tags: ["define", "example"],
        marks: 2,
        keywords: ["embedded system", "controller"]
      }
    ]
  },
  "cs-4": {
    "OS": [
      {
        question: "State two functions of an operating system.",
        answer: "Examples: memory management, file management, process scheduling, device control, security.",
        paper: "2023 May/June Paper 13",
        topic: "OS",
        tags: ["state"],
        marks: 2,
        keywords: ["operating system", "functions", "memory", "files", "scheduling"]
      },
      {
        question: "Describe how an interrupt is handled by the CPU.",
        answer: "Any four from:\nThe CPU completes the current fetch-execute cycle\nThe contents of the registers (PC/ACC) are saved\n... to the stack\nThe source of the interrupt is identified\nThe appropriate Interrupt Service Routine (ISR) is called/executed\nOnce the ISR is complete, the saved register values are restored\n... from the stack\nThe CPU continues with the next instruction of the original program",
        paper: "2024 May/June Paper 11",
        topic: "OS",
        tags: ["describe"],
        marks: 4,
        keywords: ["interrupt", "CPU", "ISR", "stack", "registers"]
      },
      {
        question: "Explain the purpose of an interrupt signal.",
        answer: "It is a signal sent to the processor/CPU to request attention\nIt causes the processor to stop its current task to service a higher priority task",
        paper: "2023 Oct/Nov Paper 12",
        topic: "OS",
        tags: ["explain"],
        marks: 2,
        keywords: ["interrupt", "signal", "CPU", "attention"]
      },
      {
        question: "Compare CLI and GUI with one advantage of each.",
        answer: "CLI:\nAllows precise control via commands\n... uses fewer system resources\n\nGUI:\nMore intuitive/easier for beginners\n... allows WIMP interactions (windows, icons, menus, pointer)",
        paper: "2024 Oct/Nov Paper 12",
        topic: "OS",
        tags: ["compare"],
        marks: 2,
        keywords: ["CLI", "GUI", "interface", "advantages"]
      }
    ],
    "Languages": [
      {
        question: "Compare compiler and interpreter.",
        answer: "A compiler translates the whole program into object code before execution; an interpreter translates and executes line by line at runtime.",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Languages",
        tags: ["compare"],
        marks: 4,
        keywords: ["compiler", "interpreter", "object code", "runtime"]
      },
      {
        question: "State two advantages of using a High-Level Language (HLL) compared to a Low-Level Language (LLL).",
        answer: "Any two from:\nEasier to understand/read/write (for humans)\n... as it uses English-like statements\nEasier to debug/find errors\nPortable/machine independent\n... code can run on different hardware without rewrite",
        paper: "2024 May/June Paper 12",
        topic: "Languages",
        tags: ["state", "compare"],
        marks: 2,
        keywords: ["high-level language", "low-level language", "portable", "debug"]
      },
      {
        question: "Explain why a programmer might choose to write code in Assembly Language.",
        answer: "Any two from:\nTo have direct control over the hardware\nTo write code that occupies less memory\nTo write code that executes faster/more efficiently\nNo need for a compiler/interpreter (only assembler needed)\nSpecific hardware drivers often require low-level access",
        paper: "2023 May/June Paper 11",
        topic: "Languages",
        tags: ["explain"],
        marks: 2,
        keywords: ["assembly", "hardware control", "efficiency", "memory"]
      }
    ],
    "Software": [
      {
        question: "Explain the difference between system software and application software.",
        answer: "System software manages and supports computer operations; application software performs user-facing tasks.",
        paper: "2025 May/June Paper 12",
        topic: "Software",
        tags: ["explain"],
        marks: 3,
        keywords: ["system software", "application software"]
      },
      {
        question: "State one advantage of open-source software and one advantage of proprietary software.",
        answer: "Open-source: free to use/modify; community support; transparency.\nProprietary: dedicated vendor support; regular updates; polished features.",
        paper: "2025 May/June Paper 11",
        topic: "Software",
        tags: ["state", "compare"],
        marks: 2,
        keywords: ["open source", "proprietary", "advantage"]
      }
    ]
  },
  "cs-5": {
    "Web": [
      {
        question: "Describe the role of DNS in accessing websites.",
        answer: "Any two from:\nA user enters a URL/domain name in the browser\nThe DNS system is queried to resolve the name\nDNS servers maintain a distributed database of domain names and IP addresses\nIf the local DNS does not have the record, it queries other DNS servers\nThe DNS returns the corresponding IP address to the client\nThe browser uses the IP address to connect to the web server\nDNS may cache results to speed up future lookups",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Web",
        tags: ["describe"],
        marks: 2,
        keywords: ["DNS", "IP address", "domain"]
      },
      {
        question: "Explain the difference between HTTP and HTTPS.",
        answer: "HTTP:\nData is sent in plain text\n... so it can be intercepted/read by a third party\nDoes not provide authentication of the server\n\nHTTPS:\nUses TLS/SSL to encrypt communication\n... so intercepted data cannot be understood\nVerifies the identity of the web server (via digital certificates)",
        paper: "2024 May/June Paper 21",
        topic: "Web",
        tags: ["compare", "explain"],
        marks: 3,
        keywords: ["HTTP", "HTTPS", "TLS", "SSL", "encryption"]
      },
      {
        question: "Explain the purpose of a cookie.",
        answer: "Any two from:\nTo store user preferences/settings\n... e.g., language choice, theme\nTo track user browsing habits/analytics\nTo implement shopping carts\n... holding items while user browses\nTo keep a user logged in (session management)",
        paper: "2024 May/June Paper 12",
        topic: "Web",
        tags: ["explain"],
        marks: 2,
        keywords: ["cookie", "preferences", "tracking", "session"]
      },
      {
        question: "State two advantages of using HTTPS when shopping online.",
        answer: "Encrypts data to prevent interception/read by third parties\nAuthenticates the web server via digital certificates",
        paper: "2025 May/June Paper 12",
        topic: "Web",
        tags: ["state"],
        marks: 2,
        keywords: ["HTTPS", "encryption", "authentication", "shopping"]
      },
    ],
    "Security": [
      {
        question: "State two methods to protect users from phishing.",
        answer: "Any two from:\nEducate users to check URLs/email addresses carefully\nUse spam filters to block suspicious emails\nDo not click links in unsolicited emails\nCheck for the padlock symbol/HTTPS",
        paper: "2025 Feb/Mar Paper 13",
        topic: "Security",
        tags: ["state"],
        marks: 2,
        keywords: ["phishing", "awareness", "filters", "HTTPS"]
      },
      {
        question: "Describe the process of SSL/TLS handshaking.",
        answer: "Any four from:\nThe client sends a request to the server to establish a secure connection\nThe server sends its digital certificate to the client\n... which includes the server's public key\nThe client verifies the digital certificate (authenticity and date)\nThe client generates a session key\n... encrypts it with the server's public key\n... and sends it to the server\nThe server decrypts the session key with its private key\nBoth parties now use the session key for encrypted communication",
        paper: "2024 May/June Paper 11",
        topic: "Security",
        tags: ["describe"],
        marks: 4,
        keywords: ["SSL", "TLS", "handshake", "encryption", "certificate", "public key", "private key"]
      },
      {
        question: "Explain the difference between phishing and pharming.",
        answer: "Phishing:\nInvolves sending fraudulent emails/messages\n... to trick users into revealing personal data (by clicking links)\n\nPharming:\nInvolves malicious code installed on a user's hard drive or web server\n... which redirects the user to a fake website (even if correct URL is typed)\n... without the user's knowledge",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Security",
        tags: ["compare", "explain"],
        marks: 4,
        keywords: ["phishing", "pharming", "fraud", "redirection"]
      },
      {
        question: "Explain how a digital signature is used to verify the authenticity of a document.",
        answer: "Any three from:\nA hash/digest of the document is created\n... using a hashing algorithm\nThe hash is encrypted using the sender's private key\n... to create the digital signature\nThe receiver decrypts the signature using the sender's public key\n... to get the original hash\nThe receiver recalculates the hash of the received document\nIf the two hashes match, the document is authentic and unaltered",
        paper: "2025 May/June Paper 12",
        topic: "Security",
        tags: ["explain"],
        marks: 4,
        keywords: ["digital signature", "hash", "private key", "public key", "authenticity"]
      },
      {
        question: "Explain how a firewall helps protect a network.",
        answer: "Monitors and filters incoming/outgoing traffic\nBlocks unauthorised access based on rules\nCan prevent certain types of attacks (e.g., port scans)\nAllows permitted traffic while denying suspicious connections",
        paper: "2024 May/June Paper 21",
        topic: "Security",
        tags: ["explain"],
        marks: 2,
        keywords: ["firewall", "filter", "rules", "unauthorised access"]
      },
      {
        question: "Explain what a denial-of-service (DoS) attack is and state one method to prevent it.",
        answer: "DoS attack: A malicious attempt to make a network or service unavailable by overwhelming it with traffic/requests\nPrevention: Use a firewall to filter incoming traffic or apply rate limiting to block excessive requests",
        paper: "2025 May/June Paper 12",
        topic: "Security",
        tags: ["explain", "state"],
        marks: 3,
        keywords: ["DoS", "denial-of-service", "firewall", "rate limiting"]
      },
      {
        question: "Describe what a Trojan horse is and one way it can be spread.",
        answer: "Trojan horse: Malware disguised as legitimate software that performs malicious actions when executed\nSpread: Via email attachments or through downloads from untrusted/malicious websites",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Security",
        tags: ["describe"],
        marks: 2,
        keywords: ["Trojan", "malware", "email attachments", "downloads"]
      },
    ],
    "Communication": [
      // removed email protocols per syllabus focus
    ]
  },
  "apl-7": {
    "Algorithms": [
      {
        question: "Trace this pseudocode and state the final value of total given input n=5.",
        answer: "For i from 1 to 5, total accumulates 15. Final value: 15.",
        paper: "2024 Oct/Nov Paper 12",
        topic: "Algorithms",
        tags: ["trace", "calculate"],
        marks: 3,
        keywords: ["pseudocode", "loop", "trace", "accumulate"]
      },
      {
        question: "Explain the difference between selection and iteration using pseudocode examples.",
        answer: "Selection uses if/else to choose a path; iteration uses loops to repeat steps. Example: IF X>0 THEN...; FOR i=1 TO n ...",
        paper: "2025 May/June Paper 12",
        topic: "Algorithms",
        tags: ["explain", "compare"],
        marks: 4,
        keywords: ["selection", "iteration", "pseudocode", "if", "loop"]
      },
      {
        question: "Compare Linear Search and Binary Search.",
        answer: "Linear search checks every item in sequence; it works on any list but is slow for large lists. Binary search keeps dividing the list in half; it is much faster but requires the list to be sorted.",
        paper: "2023 May/June Paper 21",
        topic: "Algorithms",
        tags: ["compare"],
        marks: 4,
        keywords: ["linear search", "binary search", "sorted", "efficiency"]
      },
      {
        question: "Describe how a Bubble Sort algorithm sorts a list of numbers into ascending order.",
        answer: "Any four from:\nThe algorithm loops through the list\nIt compares each pair of adjacent elements\nIf they are in the wrong order, it swaps them\nIt records that a swap has occurred\nIt repeats the loop until a pass is made with no swaps",
        paper: "2024 May/June Paper 22",
        topic: "Algorithms",
        tags: ["describe"],
        marks: 4,
        keywords: ["bubble sort", "swap", "pass", "ascending"]
      }
    ],
    "Design": [
      {
        question: "Identify the standard flowchart symbol used for an assignment or process.",
        answer: "Rectangle",
        paper: "2023 Oct/Nov Paper 22",
        topic: "Design",
        tags: ["identify"],
        marks: 1,
        keywords: ["flowchart", "symbol", "process", "rectangle"]
      },
      {
        question: "Explain the difference between a WHILE loop and a REPEAT...UNTIL loop.",
        answer: "WHILE loop checks the condition at the start (pre-condition) and may not run at all. REPEAT...UNTIL checks the condition at the end (post-condition) and always runs at least once.",
        paper: "2024 May/June Paper 21",
        topic: "Design",
        tags: ["compare", "explain"],
        marks: 3,
        keywords: ["loop", "while", "repeat", "condition"]
      }
    ],
    "Testing": [
      {
        question: "Explain the purpose of a trace table.",
        answer: "To manually track the values of variables as the code executes, allowing logic errors to be identified.",
        paper: "2025 Feb/Mar Paper 22",
        topic: "Testing",
        tags: ["explain"],
        marks: 2,
        keywords: ["trace table", "variables", "logic error", "testing"]
      },
      {
        question: "Identify three types of test data used to test a system.",
        answer: "Normal data (valid/typical), Boundary data (extreme ends of valid range), Erroneous/Abnormal data (invalid).",
        paper: "2023 May/June Paper 21",
        topic: "Testing",
        tags: ["identify", "state"],
        marks: 3,
        keywords: ["test data", "normal", "boundary", "erroneous"]
      }
    ]
  }
};

function mergeQA(_a: QAData, b: QAData): QAData {
  const out: QAData = {};
  for (const unitId of Object.keys(b)) {
    out[unitId] = out[unitId] || {};
    const topics = b[unitId] || {};
    for (const t of Object.keys(topics)) {
      const arr: Question[] = topics[t] || [];
      const target = Math.min(3, Math.max(2, arr.length));
      const easyArr = arr.filter(q => (q.marks ?? 0) <= 2);
      const medArr = arr.filter(q => {
        const m = q.marks ?? 0;
        return (m >= 3 && m <= 4) || q.marks === undefined;
      });
      const hardArr = arr.filter(q => (q.marks ?? 0) >= 5);
      const picks: Question[] = [];
      const keys = new Set<string>();
      const pushU = (q: Question) => {
        const key = `${q.paper}::${q.question.trim()}`;
        if (!keys.has(key)) {
          picks.push(q);
          keys.add(key);
        }
      };
      if (easyArr[0]) pushU(easyArr[0]);
      if (medArr[0] && picks.length < target) pushU(medArr[0]);
      if (hardArr[0] && picks.length < target) pushU(hardArr[0]);
      for (const q of medArr) {
        if (picks.length >= target) break;
        pushU(q);
      }
      for (const q of easyArr) {
        if (picks.length >= target) break;
        pushU(q);
      }
      for (const q of arr) {
        if (picks.length >= target) break;
        pushU(q);
      }
      out[unitId][t] = picks;
    }
  }
  return out;
}

export const legacyBaseCount = Object.keys(baseQaData).length;
export const legacyHasMergeQA = typeof mergeQA === 'function';
export const qaData: QAData = loadQAFromPapers();
