export const sendMissedMedicationEmail = async (medName: string) => {
  // dummy simulation
  return new Promise((resolve) => {
    console.log(`Email sent to caretaker: Patient missed ${medName}`);
    setTimeout(resolve, 1000);
  });
};
