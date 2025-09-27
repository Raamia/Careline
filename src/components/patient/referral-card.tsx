'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Referral } from '@/types';
import { formatDate, getUrgencyColor } from '@/lib/utils';

interface ReferralCardProps {
  referral: Referral;
  onViewOptions?: (referralId: string) => void;
}

export function ReferralCard({ referral, onViewOptions }: ReferralCardProps) {
  const urgencyVariant = referral.urgency === 'stat' ? 'urgent' : 
                         referral.urgency === 'urgent' ? 'warning' : 'routine';

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-xl text-gray-900">
              {referral.specialty} Referral
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={urgencyVariant}>
                {referral.urgency.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {referral.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          {referral.urgency === 'stat' && (
            <AlertCircle className="h-6 w-6 text-red-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Reason for Referral</h4>
          <p className="text-gray-600">{referral.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Referred: {formatDate(referral.createdAt)}
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            Status: {referral.status}
          </div>
        </div>

        {referral.notes && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Additional Notes</h4>
            <p className="text-gray-600 text-sm">{referral.notes}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          {referral.status === 'pending' ? (
            <Button 
              onClick={() => onViewOptions?.(referral.id)}
              className="w-full"
              variant="medical"
            >
              View Specialist Options
            </Button>
          ) : referral.status === 'sent' ? (
            <div className="text-center text-gray-600">
              <p>Referral sent to specialist</p>
              <p className="text-sm">You will be contacted soon</p>
            </div>
          ) : referral.scheduledDate ? (
            <div className="text-center">
              <p className="font-semibold text-green-600">Appointment Scheduled</p>
              <p className="text-sm text-gray-600">
                {formatDate(referral.scheduledDate)}
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
