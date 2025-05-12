import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../server';

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const { data } = await axios.get(
          `${server}/workshop/verify-certificate/${certificateId}`
        );
        setCertificate(data.certificate);
      } catch (err) {
        setError('Invalid or expired certificate');
      } finally {
        setLoading(false);
      }
    };
    verifyCertificate();
  }, [certificateId]);

  if (loading) return <div>Verifying...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Certificate Verified!
      </h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Workshop:</span> {certificate.workshopId.name}</p>
        <p><span className="font-semibold">Participant:</span> {certificate.userId.name}</p>
        <p><span className="font-semibold">Score:</span> {certificate.score}%</p>
        <p><span className="font-semibold">Issued:</span> {new Date(certificate.issueDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CertificateVerification;