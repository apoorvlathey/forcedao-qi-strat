const numberWithCommas = (x) => {
  if (x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return "0";
  }
};

export default numberWithCommas;
