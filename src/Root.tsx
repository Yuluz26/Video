import { Composition } from "remotion";
import { Title, titleSchema } from "./compositions/Title";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Title"
      component={Title}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      schema={titleSchema}
      defaultProps={{ eyebrow: "Studio", title: "Video" }}
    />
  );
};
