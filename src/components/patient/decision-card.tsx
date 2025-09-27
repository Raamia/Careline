'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Star, CheckCircle, Users } from 'lucide-react';
import { Provider, AvailabilitySlot, CostEstimate, PatientExplainer } from '@/types';
import { formatCurrency, formatDistance, formatDateTime } from '@/lib/utils';

interface DecisionCardProps {
  providers: Provider[];
  availability: AvailabilitySlot[];
  costEstimates: CostEstimate[];
  patientExplainer?: PatientExplainer;
  onSelectProvider: (providerId: string, slot: string) => void;
}

export function DecisionCard({ 
  providers, 
  availability, 
  costEstimates, 
  patientExplainer,
  onSelectProvider 
}: DecisionCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const getProviderAvailability = (providerId: string) => {
    return availability.filter(slot => slot.providerId === providerId);
  };

  const getProviderCost = (providerId: string) => {
    return costEstimates.find(cost => cost.providerId === providerId);
  };

  return (
    <div className="space-y-6">
      {/* Patient Explainer */}
      {patientExplainer && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              What This Means for You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
              <p className="text-blue-800">{patientExplainer.summary}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">What to Expect</h4>
              <p className="text-blue-800">{patientExplainer.whatToExpect}</p>
            </div>

            {patientExplainer.whatToBring.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">What to Bring</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  {patientExplainer.whatToBring.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {patientExplainer.questions.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Questions to Ask</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  {patientExplainer.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Provider Options */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Specialist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => {
              const providerAvailability = getProviderAvailability(provider.id);
              const providerCost = getProviderCost(provider.id);
              const isSelected = selectedProvider === provider.id;

              return (
                <div
                  key={provider.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {provider.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {provider.inNetwork && (
                            <Badge variant="success">In Network</Badge>
                          )}
                          {provider.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {provider.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-2">{provider.practice}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {provider.distanceKm && formatDistance(provider.distanceKm)}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accepting New Patients
                        </div>
                      </div>

                      {/* Cost Information */}
                      {providerCost && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(providerCost.estimateLow)} - {formatCurrency(providerCost.estimateHigh)}
                            </span>
                          </div>
                          {providerCost.copay && (
                            <div className="text-sm text-gray-600">
                              Copay: {formatCurrency(providerCost.copay)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Availability */}
                      {providerAvailability.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Next Available:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {providerAvailability.slice(0, 3).map((slot) => (
                              <Badge
                                key={slot.slot}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProvider(provider.id, slot.slot);
                                }}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDateTime(slot.slot)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">
                          Select an appointment time above to continue
                        </span>
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
