import type { UnitReview } from '../types';

export const unitReviews: Record<string, UnitReview> = {
  'cs-1': {
    overview: 'Unit 1 · Data Representation — binary, numbers, text, images, sound, compression and encoding.',
    terms: {
      'Binary': {
        back: 'Base-2 number system (0 and 1)\nMS Keywords: 0 and 1, bits, machine language',
        memoryAid: '0 和 1，电脑母语'
      },
      'Denary': {
        back: 'Base-10 number system (0–9)\nMS Keywords: base 10, everyday numbers',
        memoryAid: '十进制，天天见'
      },
      'Hexadecimal': {
        back: 'Base-16 system (0–9, A–F)\nMS Keywords: shorter representation, easier for humans, group binary',
        memoryAid: '四位变一位，人类看不累'
      },
      'Overflow': {
        back: 'When result exceeds storage limit\nMS Keywords: greater than 255, cannot be stored in 8 bits',
        memoryAid: '8 位装不下，溢出报错啦'
      },
      'Logical shift': {
        back: 'Moving bits left/right\nMS Keywords: multiply by 2 (left), divide by 2 (right), bits lost',
        memoryAid: '左移乘二，右移除二，丢掉的没了'
      },
      'Two\'s complement': {
        back: 'Represent positive/negative binary\nMS Keywords: flip bits, add 1, negative number, 8-bit',
        memoryAid: '取反加一，负数藏在这里'
      },
      'ASCII': {
        back: '7/8-bit character set\nMS Keywords: 128 characters, English only, 7/8 bits',
        memoryAid: '128 个够用，英文它掌控'
      },
      'Unicode': {
        back: 'Supports all languages/emojis\nMS Keywords: more characters, emojis, 16/32 bits',
        memoryAid: '全球文字加表情，一个编码全搞定'
      },
      'Sample rate': {
        back: 'Samples per second (Hz)\nMS Keywords: number of samples per second, higher = better quality',
        memoryAid: '一秒采样多少次，音质好坏它说了算'
      },
      'Sample resolution': {
        back: 'Bits per sample\nMS Keywords: bits per sample, higher = more detail, larger file',
        memoryAid: '每次采样多少位，细节多少它分配'
      },
      'Pixel': {
        back: 'Smallest unit of an image\nMS Keywords: picture element, grid of pixels',
        memoryAid: '图像小格子，拼出大图全靠它'
      },
      'Colour depth': {
        back: 'Bits per pixel\nMS Keywords: bits per pixel, more colours, larger file',
        memoryAid: '每像素多少位，颜色深浅它指挥'
      },
      'Resolution': {
        back: 'Number of pixels in image\nMS Keywords: more pixels, higher quality, larger file size',
        memoryAid: '像素越多图越清，文件大小跟着增'
      },
      'Bit': {
        back: 'Smallest data unit\nMS Keywords: 0 or 1, binary digit',
        memoryAid: '比特最小，不是 0 就是 1'
      },
      'Nibble': {
        back: '4 bits\nMS Keywords: half a byte, 4 bits',
        memoryAid: '半字节，4 位一家亲'
      },
      'Byte': {
        back: '8 bits\nMS Keywords: 8 bits, stores one character',
        memoryAid: '一字节，8 位一起走'
      },
      'KiB / MiB / GiB': {
        back: '1024-based storage units\nMS Keywords: 1024 bytes = 1 KiB, binary prefixes',
        memoryAid: '1024 进制，不是 1000'
      },
      'Lossy compression': {
        back: 'Removes data permanently\nMS Keywords: permanently remove data, reduce quality, smaller file',
        memoryAid: '丢了就丢了，图片视频用它瘦'
      },
      'Lossless compression': {
        back: 'No data lost\nMS Keywords: no data loss, RLE, reversible, text files',
        memoryAid: '压缩不丢数，文本最爱它'
      },
      'RLE': {
        back: 'Run-Length Encoding\nMS Keywords: repeating pixels, store count + value',
        memoryAid: '重复记次数，RLE 最在行'
      }
    }
  },
  'cs-2': {
    overview: 'Unit 2 · Data Transmission — transmission modes, errors, protocols and switching.',
    terms: {
      'Packet': {
        back: 'Unit of data sent over network\nMS Keywords: fixed size, header + payload + trailer',
        memoryAid: '数据切小块，包包三件套'
      },
      'Packet header': {
        back: 'Contains source/destination IP\nMS Keywords: destination IP, packet number, originator address',
        memoryAid: '头里写地址，谁发给谁'
      },
      'Payload': {
        back: 'Actual data in packet\nMS Keywords: actual data, the data being sent',
        memoryAid: '包里装内容，真正的数据'
      },
      'Trailer': {
        back: 'End of packet (error check)\nMS Keywords: error checking, parity bits, checksum',
        memoryAid: '尾巴检查错，确保没传错'
      },
      'Packet switching': {
        back: 'Data sent in packets via different routes\nMS Keywords: different routes, reorder at destination, router controls',
        memoryAid: '分包走不同路，最后再重组'
      },
      'Serial transmission': {
        back: 'Bits sent one by one\nMS Keywords: one wire, bits in order, less interference',
        memoryAid: '一个一个传，串行慢但稳'
      },
      'Parallel transmission': {
        back: 'Multiple bits at once\nMS Keywords: multiple wires, faster, risk of skew',
        memoryAid: '一起传多位，快但易干扰'
      },
      'Simplex': {
        back: 'One-way only\nMS Keywords: one direction only, e.g. keyboard to computer',
        memoryAid: '单行道，只发不收'
      },
      'Half-duplex': {
        back: 'Both ways, but not at same time\nMS Keywords: both directions but not at same time, e.g. walkie-talkie',
        memoryAid: '对讲机，轮流说'
      },
      'Full-duplex': {
        back: 'Both ways at once\nMS Keywords: both directions simultaneously, e.g. phone call',
        memoryAid: '电话线，两边同时说'
      },
      'USB interface': {
        back: 'Universal Serial Bus\nMS Keywords: serial, plug and play, hot-swappable',
        memoryAid: '插上就能用，通用串行总线'
      },
      'Parity check': {
        back: 'Odd/even bit for error detection\nMS Keywords: parity bit, odd/even, count 1s, detect error',
        memoryAid: '数 1 的个数，奇偶对不上就是错'
      },
      'Checksum': {
        back: 'Sum of data for error check\nMS Keywords: sum of data, compare after transmission, detect error',
        memoryAid: '数据求和，对比看是否一样'
      },
      'Echo check': {
        back: 'Send back to verify\nMS Keywords: send back data, compare with original, detect error',
        memoryAid: '发回去对比，看是不是原样'
      },
      'Check digit': {
        back: 'Last digit in ISBN/barcode\nMS Keywords: ISBN, barcode, modulo check, detect entry error',
        memoryAid: '最后一位防输错，ISBN 条形码'
      },
      'ARQ': {
        back: 'Automatic Repeat Query\nMS Keywords: acknowledgement, timeout, retransmit, positive/negative ACK',
        memoryAid: '错了就重传，超时就再来'
      },
      'Encryption': {
        back: 'Scrambling data for security\nMS Keywords: scramble, unauthorised access, public/private key',
        memoryAid: '数据加密防偷看，公钥私钥来保护'
      },
      'Symmetric encryption': {
        back: 'Same key to encrypt/decrypt\nMS Keywords: same key, faster, less secure',
        memoryAid: '一把钥匙，开锁也锁'
      },
      'Asymmetric encryption': {
        back: 'Public/private key pair\nMS Keywords: public key encrypt, private key decrypt, slower',
        memoryAid: '公钥加密，私钥解密'
      }
    }
  },
  'cs-3': {
    overview: 'Unit 3 · Hardware — components, architecture, input/output and storage.',
    terms: {
      'CPU': {
        back: 'Central Processing Unit\nMS Keywords: processes instructions, run FDE cycles',
        memoryAid: '电脑大脑，处理指令'
      },
      'Microprocessor': {
        back: 'CPU on a single chip\nMS Keywords: single chip, embedded systems',
        memoryAid: '单芯片 CPU，小设备用它'
      },
      'RAM': {
        back: 'Random Access Memory\nMS Keywords: volatile, data lost, power off, temporary',
        memoryAid: '一断电就失忆，临时工 RAM'
      },
      'ROM': {
        back: 'Read Only Memory\nMS Keywords: non-volatile, permanent, stores boot instructions',
        memoryAid: '只读不写永不失忆，开机第一站'
      },
      'Cache': {
        back: 'Fast memory inside CPU\nMS Keywords: frequently used data, fast access, between CPU and RAM',
        memoryAid: 'CPU 小助手，常用数据它先有'
      },
      'ALU': {
        back: 'Arithmetic Logic Unit\nMS Keywords: calculations, logic operations',
        memoryAid: '算术逻辑，它来算'
      },
      'CU': {
        back: 'Control Unit\nMS Keywords: manages data flow, decodes instructions',
        memoryAid: '控制单元，发号施令'
      },
      'PC': {
        back: 'Program Counter\nMS Keywords: holds address of next instruction, increments after fetch',
        memoryAid: '下一条指令地址，取完就加一'
      },
      'MAR': {
        back: 'Memory Address Register\nMS Keywords: holds address of data/instruction, used in fetch',
        memoryAid: '存地址，找数据'
      },
      'MDR': {
        back: 'Memory Data Register\nMS Keywords: holds data fetched from memory, temporary storage',
        memoryAid: '存数据，暂存用'
      },
      'CIR': {
        back: 'Current Instruction Register\nMS Keywords: holds current instruction being executed',
        memoryAid: '管当前，正执行'
      },
      'ACC': {
        back: 'Accumulator\nMS Keywords: stores results of calculations',
        memoryAid: '累加器，算完结果先放这'
      },
      'Address bus': {
        back: 'Carries memory addresses\nMS Keywords: carries addresses, unidirectional',
        memoryAid: '传地址，指明去哪'
      },
      'Data bus': {
        back: 'Carries data\nMS Keywords: carries data, bidirectional',
        memoryAid: '传数据，内容在它'
      },
      'Control bus': {
        back: 'Carries control signals\nMS Keywords: carries control signals, bidirectional',
        memoryAid: '传命令，谁谁干活'
      },
      'FDE cycle': {
        back: 'Fetch-Decode-Execute\nMS Keywords: fetch, decode, execute, CPU cycle',
        memoryAid: 'Execute a continuous cycle of fetch, decode, then execute.',
        diagram: '1. PC → MAR → Memory → MDR → CIR\n2. CU decodes IR, prepares ALU/controls.\n3. ALU executes and stores result in ACC/MDR/memory.',
        animation: 'fde-cycle'
      },
      'Phasing process': {
        back: 'Instruction cycle phases\nMS Keywords: fetch phase, decode phase, execute phase, sequential',
        memoryAid: 'CPU processes each instruction in sequential phases.',
        diagram: 'Fetch → Decode → Execute → Repeat',
        animation: 'phasing-process'
      },
      'Core': {
        back: 'Processing unit in CPU\nMS Keywords: multiple cores = parallel processing, better performance',
        memoryAid: '多核多大脑，一起干活快'
      },
      'Clock speed': {
        back: 'Cycles per second (GHz)\nMS Keywords: more cycles = faster CPU, measured in GHz',
        memoryAid: '时钟频率，快慢看它'
      },
      'Instruction set': {
        back: 'Commands CPU understands\nMS Keywords: list of commands, machine code',
        memoryAid: 'CPU 能懂的命令集'
      },
      'Embedded system': {
        back: 'Dedicated function system\nMS Keywords: dedicated task, e.g. washing machine, microwave',
        memoryAid: '专一用途，洗衣机微波炉'
      },
      'Virtual memory': {
        back: 'Uses hard drive as RAM\nMS Keywords: extension of RAM, pages transferred, prevents crash',
        memoryAid: '硬盘当内存，不够就用它'
      },
      'Cloud storage': {
        back: 'Online storage\nMS Keywords: remote servers, accessed via internet, scalable',
        memoryAid: '云存储，网上存，随时随地都能取'
      },
      'NIC': {
        back: 'Network Interface Card\nMS Keywords: connects computer to network, has MAC address',
        memoryAid: '上网卡，连网络'
      },
      'MAC address': {
        back: 'Physical address of device\nMS Keywords: unique, hexadecimal, manufacturer code + serial',
        memoryAid: '设备身份证，全球唯一'
      },
      'IP address': {
        back: 'Logical address of device\nMS Keywords: IPv4 / IPv6, static or dynamic, assigned by router',
        memoryAid: '网络地址，动态或固定'
      },
      'Router': {
        back: 'Forwards data between networks\nMS Keywords: forwards packets, assigns IP, connects to internet',
        memoryAid: '路由器，指路送数据'
      }
    }
  },
  'cs-4': {
    overview: 'Unit 4 · Software — system software, application software and language translators.',
    terms: {
      'System software': {
        back: 'Runs the computer\nMS Keywords: operating system, utilities, manages hardware',
        memoryAid: '系统软件，后台运行'
      },
      'Application software': {
        back: 'User programs\nMS Keywords: word processor, spreadsheet, user tasks',
        memoryAid: '应用软件，用户用'
      },
      'OS': {
        back: 'Operating System\nMS Keywords: manages files, interrupts, memory, users, peripherals',
        memoryAid: '操作系统，管硬件软件'
      },
      'Interrupt': {
        back: 'Signal to CPU\nMS Keywords: hardware/software interrupt, priority, ISR',
        memoryAid: '打断 CPU，有急事'
      },
      'ISR': {
        back: 'Interrupt Service Routine\nMS Keywords: handles interrupt, returns after processing',
        memoryAid: '中断服务，处理急事'
      },
      'Firmware': {
        back: 'Software on hardware\nMS Keywords: stored in ROM, bootloader, runs OS',
        memoryAid: '固件，硬件里的小程序'
      },
      'High-level language': {
        back: 'Human-readable code\nMS Keywords: easier to read/write/debug, portable',
        memoryAid: '高级语言，人易懂'
      },
      'Low-level language': {
        back: 'Machine/assembly\nMS Keywords: harder to read, direct hardware control, faster',
        memoryAid: '低级语言，机器懂'
      },
      'Assembler': {
        back: 'Translates assembly to machine\nMS Keywords: assembly to machine code, one-to-one',
        memoryAid: '汇编转机器，它来做'
      },
      'Compiler': {
        back: 'Translates all code at once\nMS Keywords: whole code, executable file, error report all at once',
        memoryAid: '全篇翻译，一次搞定'
      },
      'Interpreter': {
        back: 'Translates line by line\nMS Keywords: line by line, stops at error, easier to debug',
        memoryAid: '逐行翻译，边看边做'
      },
      'IDE': {
        back: 'Integrated Development Environment\nMS Keywords: code editor, runtime, debugger, auto-complete, prettyprint',
        memoryAid: '编程神器，写跑改一体'
      }
    }
  },
  'cs-5': {
    overview: 'Unit 5 · Internet & Cyber Security — internet, WWW, security threats and protection.',
    terms: {
      'Internet': {
        back: 'Global network of networks\nMS Keywords: infrastructure, network of networks',
        memoryAid: '网络之网，全球连'
      },
      'WWW': {
        back: 'World Wide Web\nMS Keywords: collection of websites, accessed via internet',
        memoryAid: '网页世界，靠浏览器'
      },
      'URL': {
        back: 'Web address\nMS Keywords: protocol + domain + file path, e.g. https://...',
        memoryAid: '网址，点开看网页'
      },
      'HTTP': {
        back: 'HyperText Transfer Protocol\nMS Keywords: transfers web pages, unencrypted',
        memoryAid: '网页传输，无加密'
      },
      'HTTPS': {
        back: 'Secure HTTP\nMS Keywords: encrypted, SSL/TLS, secure',
        memoryAid: '加密传输，小锁头'
      },
      'Browser': {
        back: 'Renders web pages\nMS Keywords: renders HTML, address bar, bookmarks, history, tabs',
        memoryAid: '浏览器，渲染网页'
      },
      'DNS': {
        back: 'Domain Name System\nMS Keywords: DNS lookup, resolution, cache, recursive query, authoritative server',
        memoryAid: 'Translate URLs to IP addresses through DNS resolution.',
        diagram: '1. User enters URL.\n2. Browser asks resolver.\n3. Resolver queries root/TLD/auth DNS.\n4. Resolver returns IP to browser.\n5. Browser connects to web server.',
        animation: 'dns-resolution'
      },
      'HTML': {
        back: 'HyperText Markup Language\nMS Keywords: structure of web pages, tags',
        memoryAid: '网页语言，结构它定'
      },
      'Cookie': {
        back: 'Small text file from website\nMS Keywords: stores preferences, login details, session/persistent',
        memoryAid: '小饼干，记你喜好'
      },
      'Digital currency': {
        back: 'Electronic money\nMS Keywords: Bitcoin, blockchain, no physical form',
        memoryAid: '电子钱，非实体'
      },
      'Blockchain': {
        back: 'Digital ledger\nMS Keywords: time-stamped records, cannot be altered',
        memoryAid: '区块链，账本不可改'
      },
      'Malware': {
        back: 'Malicious software\nMS Keywords: virus, worm, Trojan, ransomware, spyware',
        memoryAid: '恶意软件，坏家伙'
      },
      'Virus': {
        back: 'Self-replicating malware\nMS Keywords: attaches to files, spreads when opened',
        memoryAid: '病毒，附在文件上'
      },
      'Worm': {
        back: 'Self-replicating without host\nMS Keywords: spreads across networks, no host needed',
        memoryAid: '蠕虫，自我复制'
      },
      'Trojan': {
        back: 'Disguised as legitimate software\nMS Keywords: looks legitimate, steals data',
        memoryAid: '木马，假装好人'
      },
      'Ransomware': {
        back: 'Encrypts data for ransom\nMS Keywords: encrypts files, demands payment',
        memoryAid: '勒索软件，不给钱不解锁'
      },
      'Brute-force attack': {
        back: 'Trial and error to guess password\nMS Keywords: trial and error, guess password, repeatedly',
        memoryAid: '暴力破解，一个一个试'
      },
      'Two-step verification': {
        back: 'Extra security method\nMS Keywords: 2FA, extra security layer',
        memoryAid: '两步验证，双保险'
      },
      'Phishing': {
        back: 'Fake emails/links\nMS Keywords: trick user, fake login page, steal credentials',
        memoryAid: '钓鱼邮件，骗你点'
      },
      'Pharming': {
        back: 'Redirects to fake website\nMS Keywords: redirects to fake site, DNS poisoning',
        memoryAid: '域名被劫持，user不知情'
      },
      'Firewall': {
        back: 'Network security barrier\nMS Keywords: filters traffic, rules, blocks unauthorised access',
        memoryAid: '防火墙，拦坏人'
      },
      'SSL': {
        back: 'Secure Sockets Layer\nMS Keywords: encrypts data, digital certificate, authentication',
        memoryAid: '加密层，网上安全'
      },
      'Proxy server': {
        back: 'Intermediary server\nMS Keywords: hides IP, caching, filters requests',
        memoryAid: '代理服务器，隐藏你身份'
      },
      'Access levels': {
        back: 'User permissions\nMS Keywords: read only, edit, delete, different users',
        memoryAid: '不同权限，谁能看谁能改'
      }
    }
  },
  'cs-6': {
    overview: 'Unit 6 · Automated & Emerging Tech — automated systems, robotics, AI and machine learning.',
    terms: {
      'Automated system': {
        back: 'Uses sensors/actuators\nMS Keywords: sensors, microprocessor, actuator, no human',
        memoryAid: '自动化，传感器加动'
      },
      'Sensor': {
        back: 'Detects physical data\nMS Keywords: temperature, light, pressure, flow, humidity',
        memoryAid: '传感器，感知世界'
      },
      'Actuator': {
        back: 'Moves or controls\nMS Keywords: motor, valve, physical action',
        memoryAid: '执行器，动手动脚'
      },
      'Robotics': {
        back: 'Design and use of robots\nMS Keywords: mechanical structure, programmable, sensors/actuators',
        memoryAid: '机器人学，造机器人'
      },
      'AI': {
        back: 'Artificial Intelligence\nMS Keywords: learn, reason, adapt, data + rules',
        memoryAid: '人工智能，模拟人脑'
      },
      'Expert system': {
        back: 'AI with rules + knowledge\nMS Keywords: knowledge base, rule base, inference engine, interface',
        memoryAid: '专家系统，规则加知识'
      },
      'Knowledge base': {
        back: 'Stores facts\nMS Keywords: facts about a domain, data storage',
        memoryAid: '知识库，存事实'
      },
      'Rule base': {
        back: 'Stores rules\nMS Keywords: IF-THEN rules, logic',
        memoryAid: '规则库，存逻辑'
      },
      'Inference engine': {
        back: 'Applies rules to knowledge\nMS Keywords: matches facts with rules, draws conclusions',
        memoryAid: '推理引擎，得出结论'
      },
      'Machine learning': {
        back: 'AI that learns from data\nMS Keywords: adapts, feedback, improves over time',
        memoryAid: '机器学习，越学越聪明'
      }
    }
  }
};

export default unitReviews;
