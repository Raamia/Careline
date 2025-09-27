import { CostEstimate, Provider } from '@/types';
import { serverAgentTaskService } from '@/lib/database';

interface CostAgentInput {
  referralId: string;
  providers: Provider[];
  patientInsurance?: {
    provider: string;
    planType: string;
    memberId: string;
  };
  cptCodes?: string[];
}

interface CostAgentOutput {
  estimates: CostEstimate[];
}

// Mock insurance network data
const insuranceNetworks = {
  'Blue Cross Blue Shield': {
    'PPO': {
      inNetworkProviders: ['provider-cardio-001', 'provider-cardio-002', 'provider-derm-001'],
      copay: 30,
      coinsurance: 0.2, // 20%
      deductible: 1500
    },
    'HMO': {
      inNetworkProviders: ['provider-cardio-001', 'provider-ortho-001'],
      copay: 15,
      coinsurance: 0.1, // 10%
      deductible: 500
    }
  },
  'Kaiser Permanente': {
    'HMO': {
      inNetworkProviders: ['provider-cardio-002', 'provider-derm-001'],
      copay: 20,
      coinsurance: 0.15, // 15%
      deductible: 750
    }
  },
  'Aetna': {
    'PPO': {
      inNetworkProviders: ['provider-cardio-001', 'provider-cardio-003', 'provider-ortho-001'],
      copay: 35,
      coinsurance: 0.25, // 25%
      deductible: 2000
    }
  }
};

// Mock procedure costs by specialty
const procedureCosts = {
  'Cardiology': {
    'new_patient_consultation': { base: 400, range: [350, 500] },
    'follow_up': { base: 250, range: [200, 300] },
    'echocardiogram': { base: 800, range: [700, 1000] },
    'stress_test': { base: 1200, range: [1000, 1500] },
    'ekg': { base: 150, range: [100, 200] }
  },
  'Dermatology': {
    'new_patient_consultation': { base: 300, range: [250, 400] },
    'follow_up': { base: 200, range: [150, 250] },
    'biopsy': { base: 500, range: [400, 700] },
    'mole_removal': { base: 350, range: [300, 450] }
  },
  'Orthopedics': {
    'new_patient_consultation': { base: 350, range: [300, 450] },
    'follow_up': { base: 225, range: [175, 275] },
    'xray': { base: 200, range: [150, 250] },
    'mri': { base: 2500, range: [2000, 3000] },
    'injection': { base: 400, range: [300, 500] }
  }
};

export class CostAgent {
  async estimateCosts(input: CostAgentInput): Promise<CostAgentOutput> {
    console.log('Cost Agent: Estimating costs', input);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'cost',
      referralId: input.referralId,
      status: 'running',
      inputs: input
    });

    try {
      // Simulate API delay for insurance verification
      await new Promise(resolve => setTimeout(resolve, 1200));

      const estimates: CostEstimate[] = [];

      for (const provider of input.providers) {
        const estimate = await this.calculateCostForProvider(provider, input);
        estimates.push(estimate);
      }

      console.log(`Cost Agent: Generated ${estimates.length} cost estimates`);

      const output: CostAgentOutput = {
        estimates
      };

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', output);
      
      return output;

    } catch (error) {
      console.error('Cost Agent: Error estimating costs', error);
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, error.message);
      throw error;
    }
  }

  private async calculateCostForProvider(
    provider: Provider, 
    input: CostAgentInput
  ): Promise<CostEstimate> {
    // Get base costs for this specialty
    const specialtyCosts = procedureCosts[provider.specialty] || procedureCosts['Cardiology'];
    const consultationCost = specialtyCosts['new_patient_consultation'];

    // Mock insurance calculation - in real life, this would call insurance APIs
    const insuranceInfo = input.patientInsurance || {
      provider: 'Blue Cross Blue Shield',
      planType: 'PPO',
      memberId: 'mock'
    };

    const networkInfo = insuranceNetworks[insuranceInfo.provider]?.[insuranceInfo.planType];
    
    let estimateLow = consultationCost.range[0];
    let estimateHigh = consultationCost.range[1];
    let copay = 0;
    let coinsurance = 0;
    let deductible = 0;
    let notes = '';

    if (networkInfo && networkInfo.inNetworkProviders.includes(provider.id)) {
      // In-network calculation
      copay = networkInfo.copay;
      coinsurance = networkInfo.coinsurance;
      deductible = networkInfo.deductible;
      
      // Calculate patient responsibility
      const afterCopay = Math.max(0, consultationCost.base - copay);
      const afterDeductible = Math.max(0, afterCopay - deductible);
      const coinsuranceAmount = afterDeductible * coinsurance;
      
      estimateLow = copay + Math.min(deductible, afterCopay) + (consultationCost.range[0] - consultationCost.base) * coinsurance;
      estimateHigh = copay + Math.min(deductible, afterCopay) + (consultationCost.range[1] - consultationCost.base) * coinsurance + coinsuranceAmount;
      
      notes = 'In-network provider. Costs may vary based on deductible remaining.';
    } else {
      // Out-of-network calculation
      estimateLow = consultationCost.range[0] * 1.5;
      estimateHigh = consultationCost.range[1] * 2.0;
      notes = 'Out-of-network provider. Higher costs apply.';
    }

    // Add some randomness to make it more realistic
    const variance = 0.1;
    estimateLow = Math.round(estimateLow * (1 - variance + Math.random() * variance * 2));
    estimateHigh = Math.round(estimateHigh * (1 - variance + Math.random() * variance * 2));

    return {
      providerId: provider.id,
      estimateLow: Math.max(estimateLow, 0),
      estimateHigh: Math.max(estimateHigh, estimateLow),
      copay: copay || undefined,
      deductible: deductible || undefined,
      coinsurance: coinsurance || undefined,
      notes
    };
  }

  async verifyInsurance(
    patientId: string, 
    insuranceInfo: {
      provider: string;
      planType: string;
      memberId: string;
    }
  ): Promise<{
    verified: boolean;
    benefits: {
      copay: number;
      deductible: number;
      coinsurance: number;
      maxOutOfPocket: number;
    };
    inNetworkProviders: string[];
  }> {
    console.log('Cost Agent: Verifying insurance', { patientId, insuranceInfo });
    
    // Simulate insurance verification API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    const networkInfo = insuranceNetworks[insuranceInfo.provider]?.[insuranceInfo.planType];
    
    if (!networkInfo) {
      return {
        verified: false,
        benefits: { copay: 0, deductible: 0, coinsurance: 0, maxOutOfPocket: 0 },
        inNetworkProviders: []
      };
    }

    return {
      verified: true,
      benefits: {
        copay: networkInfo.copay,
        deductible: networkInfo.deductible,
        coinsurance: networkInfo.coinsurance,
        maxOutOfPocket: 8000 // Mock max out of pocket
      },
      inNetworkProviders: networkInfo.inNetworkProviders
    };
  }

  async getProcedureCosts(
    specialty: string, 
    procedureType: string
  ): Promise<{ base: number; range: [number, number] } | null> {
    const specialtyCosts = procedureCosts[specialty];
    if (!specialtyCosts) return null;
    
    return specialtyCosts[procedureType] || null;
  }

  async updatePricing(
    specialty: string, 
    procedureType: string, 
    newCosts: { base: number; range: [number, number] }
  ): Promise<void> {
    console.log('Cost Agent: Updating pricing', { specialty, procedureType, newCosts });
    
    // In a real system, this would update the pricing database
    if (procedureCosts[specialty]) {
      procedureCosts[specialty][procedureType] = newCosts;
    }
  }

  async getInsuranceNetworks(): Promise<typeof insuranceNetworks> {
    return insuranceNetworks;
  }
}
