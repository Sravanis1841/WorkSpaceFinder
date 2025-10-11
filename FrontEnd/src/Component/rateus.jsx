import React, { useState } from "react";
import axios from "axios";
import "../Styles/rateus.css";
import Heading from "./heading";

function RateUsForm() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);

  const emojis = ["😡", "😞", "😐", "😊", "😍"];
  const feedbackTexts = ["Very Bad", "Bad", "Okay", "Good", "Excellent"];

  const handleRatingClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if rating is selected and email is provided
  if (rating === 0 || email.trim() === "") {
    setShowModal(true); // Show modal for missing rating or email
    return;
  }

  try {
    // Send rating, feedback, and email to the backend
       const response = await axios.post("https://workspacefinder.onrender.com/send-feedback", {
      rating: feedbackTexts[rating - 1],
      feedback,
      email,
    });

    if (response.data.success) {
      console.log("Feedback sent successfully.");
      setShowModal(true); // Show success modal after submission
    } else {
      console.error("Failed to send feedback:", response.data.message);
      // You might want to show an error modal here
    }
  } catch (error) {
    console.error("Error while sending feedback:", error);
    // You might want to show an error modal here
  }
};

  const closeModal = () => {
    setShowModal(false);
    // Reset form if desired
    setRating(0);
    setFeedback("");
    setEmail("");
  };

  const styles = {
    container: { textAlign: "center"},
    emoji: { fontSize: "50px", cursor: "pointer", margin: "10px" },
    selectedEmoji: { fontSize: "60px", color: "#007BFF" },
    button: {
      backgroundColor: "#007BFF",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      marginTop: "20px",
    },
    feedbackBox: {
      width: "80%",
      height: "80px",
      marginTop: "15px",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      resize: "none",
    },
    feedbackText: { fontSize: "18px", marginTop: "10px", fontWeight: "bold" },
    emailInput: {
      width: "80%",
      padding: "10px",
      marginTop: "15px",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "10px",
      textAlign: "center",
      maxWidth: "400px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    },
    modalButton: {
      marginTop: "15px",
      padding: "10px 20px",
      backgroundColor: "#007BFF",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
   <>
   <Heading/>
    <div style={styles.container}>
      <h2 className="register-heading">
        <i>Rate Us</i>
      </h2>
      <div>
        {emojis.map((emoji, index) => (
          <span
            key={index}
            style={rating === index + 1 ? styles.selectedEmoji : styles.emoji}
            onClick={() => handleRatingClick(index)}
          >
            {emoji}
          </span>
        ))}
      </div>
      {rating > 0 && (
        <div style={styles.feedbackText}>{feedbackTexts[rating - 1]}</div>
      )}

      <input
        type="email"
        placeholder="Enter your email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.emailInput}
      />
      <textarea
        placeholder="Write your feedback here..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={styles.feedbackBox}
      />
      <br />
      <button onClick={handleSubmit} style={styles.button}>
        Submit
      </button>

      {showModal && (
  <div style={styles.modal}>
    <div style={styles.modalContent}>
      {/* Show success message if rating and email are provided */}
      {rating > 0 && email.trim() !== "" ? (
        <>
          <h3>Thank you for your feedback!</h3>
          <p>Your rating: {feedbackTexts[rating - 1]}</p>
          {feedback && <p>Feedback: {feedback}</p>}
          <p>Email: {email}</p>
        </>
      ) : (
        // Show error message if rating or email is missing
        <h3>Please select a rating and provide your email.</h3>
      )}
      <button onClick={closeModal} style={styles.modalButton}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
   </>
  );
}

export default RateUsForm;

 