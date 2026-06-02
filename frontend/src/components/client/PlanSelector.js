import React from 'react';
import { PLAN_LIMITS } from '../../utils/constants';

const PlanSelector = ({ currentPlan, onSelectPlan }) => {
  const plans = [
    { key: 'free', name: 'Free Listing', desc: 'Basic profile — always free', price: 'R0', features: [
      'Company logo',
      'Short description',
      'Contact form (clickable)',
      'Social media handles',
    ]},
    { key: 'pro', name: 'Parental Plus+', desc: 'Full profile + direct contact details', price: 'R149', features: [
      'Company logo & short description',
      'Direct contact details — clickable',
      'Social media handles',
      'Monthly newsletter inclusion',
      '1x Facebook & Instagram post',
      '1x Native article (800 words)',
    ]},
  ];

  return (
    <div className="plan-selection">
      {plans.map(plan => {
        const isSelected = currentPlan === plan.key;
        const limits = PLAN_LIMITS[plan.key];

        return (
          <div 
            key={plan.key}
            className={`plan-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectPlan(plan.key)}
            data-plan={plan.key}
          >
            <h4>{plan.name}</h4>
            <div className="plan-desc">{plan.desc}</div>
            <div className="plan-price">{plan.price}</div>
            <div className="plan-period">/ month</div>
            <ul className="feature-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <i className="fas fa-check-circle"></i> {feature}
                </li>
              ))}
              <li>
                <i className="fas fa-check-circle"></i> Max {limits.maxServices} services
              </li>
            </ul>
            {isSelected && (
              <div className="current-plan-badge">Current</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanSelector;