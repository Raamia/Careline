import { Provider } from '@/types';
import { serverProviderService, serverAgentTaskService } from '@/lib/database';

interface DirectoryAgentInput {
  referralId: string;
  specialty: string;
  patientId: string;
  zipCode?: string;
}

interface DirectoryAgentOutput {
  providers: Provider[];
}

// Mock provider data - in production, this would connect to real NPI database
const mockProviderDatabase: Provider[] = [
  {
    id: 'provider-cardio-001',
    name: 'Dr. Sarah Chen',
    npiNumber: '1234567890',
    specialty: 'Cardiology',
    practice: 'Heart & Vascular Institute',
    address: {
      street: '123 Medical Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    phone: '(555) 123-4567',
    email: 'schen@heartinstitute.com',
    distanceKm: 2.5,
    inNetwork: true,
    rating: 4.8,
    acceptingNewPatients: true
  },
  {
    id: 'provider-cardio-002',
    name: 'Dr. Michael Rodriguez',
    npiNumber: '1234567891',
    specialty: 'Cardiology',
    practice: 'Bay Area Cardiology',
    address: {
      street: '456 Health Plaza',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    phone: '(555) 987-6543',
    email: 'mrodriguez@bayareacardio.com',
    distanceKm: 4.2,
    inNetwork: true,
    rating: 4.7,
    acceptingNewPatients: true
  },
  {
    id: 'provider-cardio-003',
    name: 'Dr. Jennifer Kim',
    npiNumber: '1234567892',
    specialty: 'Cardiology',
    practice: 'UCSF Cardiology',
    address: {
      street: '789 Parnassus Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94143'
    },
    phone: '(555) 456-7890',
    email: 'jkim@ucsf.edu',
    distanceKm: 3.8,
    inNetwork: true,
    rating: 4.9,
    acceptingNewPatients: true
  },
  {
    id: 'provider-derm-001',
    name: 'Dr. Alex Thompson',
    npiNumber: '1234567893',
    specialty: 'Dermatology',
    practice: 'SF Dermatology Center',
    address: {
      street: '321 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    phone: '(555) 234-5678',
    email: 'athompson@sfdermatology.com',
    distanceKm: 1.2,
    inNetwork: true,
    rating: 4.6,
    acceptingNewPatients: true
  },
  {
    id: 'provider-ortho-001',
    name: 'Dr. Lisa Park',
    npiNumber: '1234567894',
    specialty: 'Orthopedics',
    practice: 'Bay Area Orthopedics',
    address: {
      street: '654 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    phone: '(555) 345-6789',
    email: 'lpark@bayortho.com',
    distanceKm: 2.1,
    inNetwork: true,
    rating: 4.7,
    acceptingNewPatients: true
  }
];

export class DirectoryAgent {
  async findProviders(input: DirectoryAgentInput): Promise<DirectoryAgentOutput> {
    console.log('Directory Agent: Finding providers', input);
    
    const taskId = await serverAgentTaskService.createTask({
      type: 'directory',
      referralId: input.referralId,
      status: 'running',
      inputs: input
    });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter providers by specialty
      let matchingProviders = mockProviderDatabase.filter(
        provider => provider.specialty.toLowerCase() === input.specialty.toLowerCase()
      );

      // Filter by accepting new patients
      matchingProviders = matchingProviders.filter(
        provider => provider.acceptingNewPatients
      );

      // Filter by in-network status (in real implementation, this would check patient's insurance)
      matchingProviders = matchingProviders.filter(
        provider => provider.inNetwork
      );

      // Sort by distance and rating
      matchingProviders.sort((a, b) => {
        const distanceDiff = (a.distanceKm || 999) - (b.distanceKm || 999);
        if (Math.abs(distanceDiff) < 1) {
          // If distances are similar, prioritize higher rating
          return (b.rating || 0) - (a.rating || 0);
        }
        return distanceDiff;
      });

      // Limit to top 5 results
      const selectedProviders = matchingProviders.slice(0, 5);

      // In a real implementation, we would save these providers to the database
      // For now, we'll just log them
      console.log(`Directory Agent: Found ${selectedProviders.length} providers for ${input.specialty}`);

      const output: DirectoryAgentOutput = {
        providers: selectedProviders
      };

      await serverAgentTaskService.updateTaskStatus(taskId, 'completed', output);
      
      return output;

    } catch (error) {
      console.error('Directory Agent: Error finding providers', error);
      await serverAgentTaskService.updateTaskStatus(taskId, 'failed', undefined, error.message);
      throw error;
    }
  }

  async getProvidersByNPI(npiNumbers: string[]): Promise<Provider[]> {
    return mockProviderDatabase.filter(provider => 
      npiNumbers.includes(provider.npiNumber)
    );
  }

  async searchProvidersByName(name: string, specialty?: string): Promise<Provider[]> {
    let results = mockProviderDatabase.filter(provider =>
      provider.name.toLowerCase().includes(name.toLowerCase())
    );

    if (specialty) {
      results = results.filter(provider =>
        provider.specialty.toLowerCase() === specialty.toLowerCase()
      );
    }

    return results;
  }

  async getProvidersByZipCode(zipCode: string, radiusKm: number = 25): Promise<Provider[]> {
    // Mock distance calculation - in real implementation, this would use actual geocoding
    return mockProviderDatabase.filter(provider =>
      (provider.distanceKm || 0) <= radiusKm
    );
  }

  async updateProviderAvailability(providerId: string, acceptingNewPatients: boolean): Promise<void> {
    console.log(`Directory Agent: Updating provider ${providerId} availability: ${acceptingNewPatients}`);
    // In real implementation, this would update the provider database
  }
}
