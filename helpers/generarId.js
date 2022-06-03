const generarId = () => {
  const id = Math.random().toString(32).substring(2) + Date.now().toString(32);
  return id;
};

export default generarId;
