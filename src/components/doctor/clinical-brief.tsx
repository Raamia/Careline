'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Pill, 
  AlertTriangle, 
  Activity, 
  User, 
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { ClinicianBrief, Referral, Patient } from '@/types';
import { formatDate } from '@/lib/utils';

interface ClinicalBriefProps {
  brief: ClinicianBrief;
  referral: Referral;
  patient?: Patient;
  onAcceptReferral?: (referralId: string) => void;
  onRequestMoreInfo?: (referralId: string) => void;
}

export function ClinicalBrief({ 
  brief, 
  referral, 
  patient,
  onAcceptReferral,
  onRequestMoreInfo 
}: ClinicalBriefProps) {
  return (
    <div className="space-y-6">
      {/* Patient Information Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-blue-900">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
              <div className="mt-2 space-y-1">
                <p className="text-blue-800">
                  <strong>Name:</strong> {patient?.name || 'Patient Name'}
                </p>
                <p className="text-blue-800">
                  <strong>DOB:</strong> January 15, 1985 (39 years old)
                </p>
                <p className="text-blue-800">
                  <strong>Insurance:</strong> {patient?.insurance.provider || 'Blue Cross Blue Shield'}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center text-blue-700">
                <Calendar className="h-4 w-4 mr-1" />
                Referred: {formatDate(referral.createdAt)}
              </div>
              <Badge variant={referral.urgency === 'stat' ? 'urgent' : 'warning'}>
                {referral.urgency.toUpperCase()} REFERRAL
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Referral Reason */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Referral Reason
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{referral.reason}</p>
          {referral.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Additional Notes:</strong> {referral.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinical Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Clinical Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Clinical Summary</h4>
            <p className="text-gray-700 leading-relaxed">{brief.clinicalSummary}</p>
          </div>

          {/* Problem List */}
          {brief.problemList.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Active Problems
              </h4>
              <div className="space-y-2">
                {brief.problemList.map((problem, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{problem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {brief.currentMedications.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Pill className="h-4 w-4 mr-2 text-blue-500" />
                Current Medications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {brief.currentMedications.map((medication, index) => (
                  <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                    <Pill className="h-3 w-3 text-blue-600 mr-2" />
                    <span className="text-blue-700 text-sm">{medication}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {brief.allergies.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Allergies
              </h4>
              <div className="space-y-2">
                {brief.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center p-2 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-3 w-3 text-red-600 mr-2" />
                    <span className="text-red-700 font-medium">{allergy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Labs */}
          {brief.keyLabs.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-green-500" />
                Recent Lab Results
              </h4>
              <div className="space-y-2">
                {brief.keyLabs.map((lab, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                    <Activity className="h-3 w-3 text-green-600 mr-2" />
                    <span className="text-green-700">{lab}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {brief.redFlags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Red Flags
              </h4>
              <div className="space-y-2">
                {brief.redFlags.map((flag, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-100 rounded-lg border-l-4 border-red-500">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-3" />
                    <span className="text-red-800 font-medium">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {brief.recommendations && brief.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {brief.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-purple-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => onAcceptReferral?.(referral.id)}
              variant="success"
              className="flex-1 sm:flex-none"
            >
              Accept Referral
            </Button>
            <Button 
              onClick={() => onRequestMoreInfo?.(referral.id)}
              variant="outline"
            >
              Request More Information
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Summary
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Full Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
