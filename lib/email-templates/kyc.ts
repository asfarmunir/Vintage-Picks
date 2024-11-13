export const getKycEmailTemplate = (name: string) => {
  const KYC_TITLE = "Welcome to the PicksHero!";
  const KYC_TEMPLATE = `<p>Hello <strong>${name}</strong>,</p><p>Your account has been <strong>KYC Verified</strong>`;
  return {
    title: KYC_TITLE,
    template: KYC_TEMPLATE,
  };
};
