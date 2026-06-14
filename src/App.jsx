import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);

  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [comment, setComment] = useState("");

  const [response, setResponse] = useState(false);
  const [interview, setInterview] = useState(false);
  const [offer, setOffer] = useState(false);
  const [suspicious, setSuspicious] = useState(false);

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setReviews(data);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function addReview() {
    if (!company.trim()) {
      alert("Company name is required!");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert([
        {
          company: company.trim().toUpperCase(),
          response,
          interview,
          offer,
          suspicious,
          comment,
          job_url: jobUrl,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Failed to save review!");
      return;
    }

    await fetchReviews();

    setCompany("");
    setJobUrl("");
    setComment("");
    setResponse(false);
    setInterview(false);
    setOffer(false);
    setSuspicious(false);

    alert("Review saved!");
  }

  const companies = Object.values(
    reviews.reduce((acc, review) => {
      const companyName = review.company
        .trim()
        .toUpperCase();

      if (!acc[companyName]) {
        acc[companyName] = {
          company: companyName,
          totalReviews: 0,
          responses: 0,
          interviews: 0,
          offers: 0,
          suspiciousReports: 0,
        };
      }

      acc[companyName].totalReviews++;

      if (review.response)
        acc[companyName].responses++;

      if (review.interview)
        acc[companyName].interviews++;

      if (review.offer)
        acc[companyName].offers++;

      if (review.suspicious)
        acc[companyName].suspiciousReports++;

      return acc;
    }, {})
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.company
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>GhostJobCheck 👻</h1>

      <div className="card">
        <h2>Search Company</h2>

        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <hr />

        <h2>Submit Review</h2>
      </div>

      <input
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) =>
          setCompany(e.target.value)
        }
      />

      <br />

      <input
        type="text"
        placeholder="Job URL (optional)"
        value={jobUrl}
        onChange={(e) =>
          setJobUrl(e.target.value)
        }
      />

      <br />
      <br />

      <label>
        <input
          type="checkbox"
          checked={response}
          onChange={(e) =>
            setResponse(e.target.checked)
          }
        />
        Received Response
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={interview}
          onChange={(e) =>
            setInterview(e.target.checked)
          }
        />
        Got Interview
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={offer}
          onChange={(e) =>
            setOffer(e.target.checked)
          }
        />
        Got Offer
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={suspicious}
          onChange={(e) =>
            setSuspicious(e.target.checked)
          }
        />
        Suspected Ghost/Fake Job
      </label>

      <br />
      <br />

      <textarea
        rows="4"
        cols="50"
        placeholder="Describe your experience..."
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={addReview}>
        Submit Review
      </button>

      <hr />

      <h2>
        Companies ({filteredCompanies.length})
      </h2>

      {
        filteredCompanies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          filteredCompanies.map((company) => {
            const responseRate = Math.round(
              (company.responses /
                company.totalReviews) *
              100
            );

            const interviewRate = Math.round(
              (company.interviews /
                company.totalReviews) *
              100
            );

            const offerRate = Math.round(
              (company.offers /
                company.totalReviews) *
              100
            );

            const trustScore = Math.round(
              responseRate * 0.5 +
              interviewRate * 0.3 +
              offerRate * 0.2
            );

            const ghostScore =
              100 - trustScore;

            let riskBadge =
              "🟢 Low Ghost Risk";

            if (ghostScore > 60) {
              riskBadge =
                "🔴 High Ghost Risk";
            } else if (ghostScore > 30) {
              riskBadge =
                "🟡 Medium Ghost Risk";
            }

            return (
              <div
                key={company.company}
                style={{
                  border:
                    "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "15px",
                }}
              >
                <h3>{company.company}</h3>

                <p>
                  <strong>
                    Ghost Score:
                  </strong>{" "}
                  {ghostScore}/100
                </p>

                <p>{riskBadge}</p>

                <p>
                  <strong>
                    Total Reviews:
                  </strong>{" "}
                  {company.totalReviews}
                </p>

                <p>
                  <strong>
                    Response Rate:
                  </strong>{" "}
                  {responseRate}%
                </p>

                <p>
                  <strong>
                    Interview Rate:
                  </strong>{" "}
                  {interviewRate}%
                </p>

                <p>
                  <strong>
                    Offer Rate:
                  </strong>{" "}
                  {offerRate}%
                </p>

                <p>
                  <strong>
                    Suspicious Reports:
                  </strong>{" "}
                  {
                    company.suspiciousReports
                  }
                </p>

                <button
                  onClick={() =>
                    setExpandedCompany(
                      expandedCompany ===
                        company.company
                        ? null
                        : company.company
                    )
                  }
                >
                  {expandedCompany ===
                    company.company
                    ? "Hide Reviews"
                    : "Show Reviews"}
                </button>

                {expandedCompany ===
                  company.company && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "15px",
                        background:
                          "#f5f5f5",
                        borderRadius: "8px",
                      }}
                    >
                      {reviews
                        .filter(
                          (review) =>
                            review.company
                              .trim()
                              .toUpperCase() ===
                            company.company
                        )
                        .map((review) => (
                          <div
                            key={review.id}
                            style={{
                              borderLeft: review.suspicious
                                ? "4px solid red"
                                : "4px solid green",
                              padding: "10px",
                              marginBottom: "10px",
                              backgroundColor: "#fff",
                              borderRadius: "6px",
                            }}
                          >
                            {review.suspicious && (
                              <p>
                                ⚠️
                                Suspicious
                                Report
                              </p>
                            )}

                            {review.comment && (
                              <p>
                                "
                                {
                                  review.comment
                                }
                                "
                              </p>
                            )}

                            {review.job_url && (
                              <p>
                                <a
                                  href={
                                    review.job_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Job
                                  Posting
                                </a>
                              </p>
                            )}

                            {review.offer ? (
                              <p>🎉 Received Offer</p>
                            ) : review.interview ? (
                              <p>🗣️ Interviewed</p>
                            ) : review.response ? (
                              <p>📨 Received Response</p>
                            ) : (
                              <p>👻 Ghosted / No Response</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
              </div>
            );
          })
        )
      }
    </div >
  );
}

export default App;