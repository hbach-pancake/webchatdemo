import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useState } from "react";

const EmojiPickerComponent = () => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleEmojiSelect = (emoji: any) => {
    setSelectedEmoji(emoji.native);
  };

  return (
    <Picker
      data={data}
      onEmojiSelect={handleEmojiSelect}
      title="Pick your emoji"
      emoji=""
    />
  );
};

export default EmojiPickerComponent;
