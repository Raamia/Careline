'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  AlertCircle, 
  FileText, 
  Calendar,
  Stethoscope
} from 'lucide-react';
import { Referral, ClinicianBrief } from '@/types';
import { formatDate } from '@/lib/utils';

interface IncomingReferralCardProps {
  referral: Referral;
  brief?: ClinicianBrief;
  patientName?: string;
  onViewDetails: (referralId: string) => void;
  onQuickAccept: (referralId: string) => void;
}

export function IncomingReferralCard({ 
  referral, 
  brief,
  patientName = 'Unknown Patient',
  onViewDetails,
  onQuickAccept 
}: IncomingReferralCardProps) {
  const urgencyVariant = referral.urgency === 'stat' ? 'urgent' : 
                         referral.urgency === 'urgent' ? 'warning' : 'routine';

  const getUrgencyIcon = () => {
    if (referral.urgency === 'stat') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getTimeSinceReferral = () => {
    const now = new Date();
    const created = new Date(referral.createdAt);
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just received';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg text-gray-900">
                {patientName}
              </CardTitle>
              {getUrgencyIcon()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={urgencyVariant}>
                {referral.urgency.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {referral.specialty}
              </Badge>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm text-gray-500">
              {getTimeSinceReferral()}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(referral.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Chief Complaint</h4>
          <p className="text-gray-600 text-sm line-clamp-2">{referral.reason}</p>
        </div>

        {brief && (
          <div className="space-y-3">
            {/* Quick Summary */}
            {brief.problemList.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1 text-sm">Key Problems</h4>
                <div className="flex flex-wrap gap-1">
                  {brief.problemList.slice(0, 3).map((problem, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {problem}
                    </Badge>
                  ))}
                  {brief.problemList.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{brief.problemList.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {brief.redFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-800 text-sm">Red Flags</span>
                </div>
                <p className="text-red-700 text-xs">
                  {brief.redFlags[0]}
                  {brief.redFlags.length > 1 && ` (+${brief.redFlags.length - 1} more)`}
                </p>
              </div>
            )}

            {/* Current Medications Count */}
            {brief.currentMedications.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Stethoscope className="h-4 w-4 mr-2" />
                {brief.currentMedications.length} current medications
              </div>
            )}
          </div>
        )}

        {!brief && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm">AI brief is being generated...</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            ID: {referral.id.slice(0, 8)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(referral.id);
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button
              variant="medical"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAccept(referral.id);
              }}
            >
              Quick Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
