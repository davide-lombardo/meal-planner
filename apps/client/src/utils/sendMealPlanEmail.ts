// Utility to call the backend email API from the React app
export async function sendMealPlanEmail(subject: string, text: string, html: string) {
  const response = await fetch('http://localhost:4000/api/send-meal-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, text, html })
  });
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
}
