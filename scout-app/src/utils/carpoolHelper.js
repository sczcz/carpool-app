export const translateCarpoolType = (type) => {
  switch (type) {
    case 'drop-off':
      return 'Avresa';
    case 'pick-up':
      return 'Hemresa';
    case 'both':
      return 'Avresa & Hemresa';
    default:
      return 'Okänd';
  }
};