// Provides starter guide content when no saved guides are available yet.
// Seeds the guide library with trusted and community examples on first launch.
export const sampleGuides = [
  {
    id: 'tg-1',
    category: 'team',
    title: 'Emergency Response Plan',
    type: 'General',
    summary: 'Step-by-step plan for responding to emergencies.',
    body: '1. Check immediate danger and move to a safer location if needed.\n\n2. Call emergency services or building management when the situation is severe.\n\n3. Inform nearby people clearly and avoid spreading unverified information.\n\n4. Keep essential items ready and follow official instructions until the area is safe again.',
    votes: 124,
    estimatedMinutes: 4,
    quiz: [
      {
        id: 'q1',
        question: 'What should you do first in an emergency?',
        options: ['Ignore the situation', 'Check immediate danger and move to safety', 'Post online first', 'Wait for others'],
        answerIndex: 1
      },
      {
        id: 'q2',
        question: 'When should you contact emergency services?',
        options: ['Only the next day', 'When the situation is severe or urgent', 'Never', 'After taking a photo'],
        answerIndex: 1
      }
    ]
  },
  {
    id: 'tg-2',
    category: 'team',
    title: 'Flood Safety Guide',
    type: 'Flood',
    summary: 'What to do before, during, and after flooding.',
    body: '1. Move valuables and electrical items above floor level.\n\n2. Avoid walking or driving through flood water.\n\n3. Turn off electricity if instructed and it is safe to do so.\n\n4. Follow official evacuation advice and return only when authorities say it is safe.',
    votes: 118,
    estimatedMinutes: 5,
    quiz: [
      {
        id: 'q1',
        question: 'What should you avoid during a flood?',
        options: ['Walking through flood water', 'Checking official updates', 'Moving valuables higher', 'Listening to warnings'],
        answerIndex: 0
      },
      {
        id: 'q2',
        question: 'When should you return after evacuating?',
        options: ['Whenever you want', 'Only after authorities say it is safe', 'As soon as rain stops', 'Immediately'],
        answerIndex: 1
      }
    ]
  },
  {
    id: 'tg-3',
    category: 'team',
    title: 'Fire Safety Guide',
    type: 'Fire',
    summary: 'Reduce risk and respond quickly to a fire.',
    body: '1. Trigger the fire alarm and call emergency services.\n\n2. Leave by the nearest safe exit and do not use lifts.\n\n3. Stay low if there is smoke.\n\n4. Do not re-enter the building until cleared by responders.',
    votes: 112,
    estimatedMinutes: 4,
    quiz: [
      {
        id: 'q1',
        question: 'What should you avoid during a building fire?',
        options: ['Using the nearest safe exit', 'Using lifts', 'Staying low in smoke', 'Calling emergency services'],
        answerIndex: 1
      },
      {
        id: 'q2',
        question: 'When should you re-enter the building?',
        options: ['After collecting your belongings', 'When responders say it is safe', 'Immediately', 'Once the alarm stops'],
        answerIndex: 1
      }
    ]
  },
  {
    id: 'cg-1',
    category: 'community',
    title: 'Family Emergency Plan',
    type: 'General',
    summary: 'Prepare your household and loved ones.',
    body: 'Choose one meeting point near home and one outside the neighbourhood. Save key phone numbers, share them with family members, and keep simple emergency supplies ready in one known place.',
    votes: 112,
    estimatedMinutes: 3,
    quiz: [
      {
        id: 'q1',
        question: 'Why have a family meeting point?',
        options: ['To avoid planning', 'To know where to regroup safely', 'To store furniture', 'To replace emergency numbers'],
        answerIndex: 1
      }
    ]
  },
  {
    id: 'cg-2',
    category: 'community',
    title: 'Build an Emergency Kit',
    type: 'General',
    summary: 'What to pack and how to be ready.',
    body: 'A simple kit can include water, snacks, a flashlight, power bank, basic medicine, and copies of important contacts. Check expiry dates regularly.',
    votes: 96,
    estimatedMinutes: 3,
    quiz: [
      {
        id: 'q1',
        question: 'Which item belongs in an emergency kit?',
        options: ['Power bank', 'Large speaker', 'Gaming console', 'Office chair'],
        answerIndex: 0
      }
    ]
  },
  {
    id: 'cg-3',
    category: 'community',
    title: 'Know Your Risks',
    type: 'Storm',
    summary: 'Understand local hazards and stay prepared.',
    body: 'Look at common risks in your area such as flooding, storms, or power outages. Knowing likely hazards helps you prepare faster and make better decisions under pressure.',
    votes: 67,
    estimatedMinutes: 2,
    quiz: [
      {
        id: 'q1',
        question: 'Why should you learn local hazards?',
        options: ['To ignore alerts', 'To prepare faster and respond better', 'To avoid planning', 'To reduce internet use'],
        answerIndex: 1
      }
    ]
  }
];
