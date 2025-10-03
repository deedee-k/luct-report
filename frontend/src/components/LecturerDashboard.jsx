import LectureForm from "./Lectureform";

export default function LecturerDashboard({ user }) {
  return (
    <div>
      <h3>Lecturer Dashboard</h3>
      <div className="card p-3">
        <h5>Submit Lecture Report</h5>
        <LectureForm />
      </div>
    </div>
  );
}
