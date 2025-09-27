'use client';

export default function Workflow() {
  const patientSteps = [
    {
      number: 1,
      title: "Secure Login",
      description: "Sign in securely with Google authentication"
    },
    {
      number: 2,
      title: "View Referral",
      description: "See your referral details like \"Cardiology for shortness of breath\""
    },
    {
      number: 3,
      title: "AI Assistance",
      description: "Get AI-powered specialist recommendations and cost explanations"
    },
    {
      number: 4,
      title: "Send Referral",
      description: "One-click referral submission with all necessary documentation"
    }
  ];

  const doctorSteps = [
    {
      number: 1,
      title: "Professional Access",
      description: "Role-based login for healthcare providers"
    },
    {
      number: 2,
      title: "Review Referrals",
      description: "Access structured patient summaries and medical history"
    },
    {
      number: 3,
      title: "Clear Documentation",
      description: "No more deciphering faxes - get clean, organized patient data"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple workflow, powerful results
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            See how Careline transforms the referral process for both patients and
            healthcare providers.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* For Patients */}
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-8">For Patients</h3>
            <div className="space-y-8">
              {patientSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold mr-4 mt-1">
                    {step.number}
                  </div>
                  
                  {/* Step Content */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Doctors */}
          <div>
            <h3 className="text-2xl font-bold text-red-600 mb-8">For Doctors</h3>
            <div className="space-y-8">
              {doctorSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold mr-4 mt-1">
                    {step.number}
                  </div>
                  
                  {/* Step Content */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
