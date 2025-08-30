import * as React from 'react';
import { Box, Typography } from '@mui/joy';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        Privacy Policy
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Your privacy is important to us. This policy explains what data we collect, how we use it, and your rights regarding your information.
      </Typography>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>1. Data Collection</Typography>
      <Typography>
        We collect only the data necessary to provide our meal planning services, such as your email address, preferences, and recipes. We do not sell or share your data with third parties.
      </Typography>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>2. Data Usage</Typography>
      <Typography>
        Your data is used solely to personalize your experience and improve our services. We may use anonymized data for analytics.
      </Typography>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>3. Data Security</Typography>
      <Typography>
        We implement industry-standard security measures to protect your information. Access to your data is restricted to authorized personnel only.
      </Typography>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>4. Your Rights</Typography>
      <Typography>
        You can request to view, update, or delete your personal data at any time. Contact support for assistance.
      </Typography>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>5. Changes to This Policy</Typography>
      <Typography>
        We may update this policy as needed. Changes will be posted on this page.
      </Typography>
      <Typography sx={{ mt: 3 }}>
        For questions or concerns, please contact us at support@mealplanner.com.
      </Typography>
    </Box>
  );
}
