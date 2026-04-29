export interface AnimationTopicInfo {
  title: string;
  summary: string;
  msKeywords: string[];
  diagrams: string[];
  animationType: 'fde-cycle' | 'dns-resolution' | 'phasing-process';
  example?: {
    instruction: string;
    steps: string[];
  };
}

export interface UnitAnimations {
  overview: string;
  topics: Record<string, AnimationTopicInfo>;
}

export const unitAnimations: Record<string, UnitAnimations> = {
  'cs-3': {
    overview: 'Unit 3 CPU and memory architecture animation guide. Focus on instruction cycle and pipeline phases.',
    topics: {
      'CPU': {
        title: 'Fetch-Decode-Execute (FDE) Cycle',
        summary: 'Step-by-step animation for one instruction passing through the CPU instruction cycle.',
        msKeywords: ['fetch', 'decode', 'execute', 'CU', 'ALU', 'MAR', 'MDR', 'CIR', 'PC'],
        diagrams: [
          `1. PC holds instruction address.
2. MAR receives address.
3. Memory returns instruction into MDR.
4. Instruction moves into CIR.
5. CU decodes the instruction and sends opcode signals.
6. ALU executes the operation and result stored to ACC/MDR or memory.`,
          'FDE cycle can repeat many times; each instruction goes through these three phases.'
        ],
        animationType: 'fde-cycle',
        example: {
          instruction: 'ADD R1, #5 (add 5 to register R1)',
          steps: [
            'FETCH: PC → MAR - Program Counter (PC) holds address of next instruction. PC copies address to Memory Address Register (MAR) using address bus.',
            'FETCH: RAM → MDR - MAR address sent to RAM. RAM places the instruction stored at that address onto the DATA BUS → Memory Data Register (MDR) receives it.',
            'FETCH: MDR → CIR - Instruction moves from MDR to Current Instruction Register (CIR) inside the Control Unit.',
            'DECODE - Control Unit (CU) decodes the instruction inside CIR using the Instruction Set. Instruction split into opcode (operation) and operand (data/address).',
            'EXECUTE: ALU operation - Arithmetic Logic Unit (ALU) performs the required operation (add, subtract, compare, etc.). ALU uses registers/values; result stored in Accumulator (ACC).',
            'EXECUTE: write-back / PC increment - Result written back to accumulator or memory (if store). Program Counter increments to next instruction address. PC = PC + 1.'
          ]
        }
      },
      'Instruction cycle phases': {
        title: 'Phasing Process',
        summary: 'Phase-by-phase breakdown of instruction cycle (fetch, decode, execute).',
        msKeywords: ['instruction cycle', 'phases', 'pipeline', 'timing', 'CPU control'],
        diagrams: [
          'Phase 1: Fetch - retrieve instruction from memory into CIR (via MAR/MDR).',
          'Phase 2: Decode - CU interprets instruction and prepares execution resources.',
          'Phase 3: Execute - ALU or CPU units perform operation, results stored.'
        ],
        animationType: 'phasing-process',
      }
    }
  },
  'cs-5': {
    overview: 'Unit 5 Internet and web services animation guide. Focus on DNS resolution and name lookups.',
    topics: {
      'Web': {
        title: 'DNS resolution flow',
        summary: 'Visualize how DNS resolves domain name into an IP address through resolver and servers.',
        msKeywords: ['DNS', 'resolver', 'root server', 'TLD server', 'authoritative server', 'recursive query'],
        diagrams: [
          `Browser asks local resolver for domain IP.
Resolver checks cache or requests root server.
Root server points to TLD server.
TLD server returns authoritative server IP.
Authoritative server returns final IP.
Resolver caches answer and sends IP to browser.`,
          'This can be described as URL -> resolver -> chain of DNS servers -> IP -> browser request'
        ],
        animationType: 'dns-resolution',
      }
    }
  }
};
