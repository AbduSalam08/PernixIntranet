const ImageSection = ({ value }: any) => {
  return (
    <img
      src={value?.images}
      alt="img"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};
export default ImageSection;
