import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { server } from '../constant';

ChartJS.register(ArcElement, Tooltip, Legend);

const Overview = () => {
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [overviewData, setOverviewData] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalMembers: 0,
    totalCards: 0,
    projects: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Role and Organization ID Response:", response.data);
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      axios.get(`${server}/api/overview/${organizationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => {
          console.log("Overview Data Response:", response.data);
          setOverviewData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the overview data!', error);
        });
    }
  }, [organizationId]);

  // Calculate sums for the pie chart
  const totalCards = overviewData.projects.reduce((acc, project) => acc + project.totalCards, 0);
  const totalPendingCards = overviewData.projects.reduce((acc, project) => acc + project.totalPendingCards, 0);
  const totalInProgressCards = overviewData.projects.reduce((acc, project) => acc + project.totalInProgressCards, 0);
  const totalCompletedCards = overviewData.projects.reduce((acc, project) => acc + project.totalCompletedCards, 0);

  const data = {
    labels: [ 'Pending Tasks', 'In-Progress Tasks', 'Completed Tasks'],
    datasets: [
      {
        label: 'Cards Overview',
        data: [ totalPendingCards, totalInProgressCards, totalCompletedCards],
        backgroundColor: [ '#f59e0b',  '#6b7280','#10b981'],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  const handleViewProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/view`);
  };

  if (!overviewData.projects.length) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', gap: '16px', marginTop: '32px' }}>
        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '20px', textAlign: 'center', maxWidth: '240px', width: '240px', height: '200px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568' }}>Total Projects</h3>
          <p style={{ marginTop: '16px', fontSize: '40px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalProjects}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '20px', textAlign: 'center', maxWidth: '240px', width: '240px', height: '200px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568' }}>Total Members</h3>
          <p style={{ marginTop: '16px', fontSize: '40px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalMembers}</p>
        </div>
        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '20px', textAlign: 'center', maxWidth: '240px', width: '240px', height: '200px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568' }}>Total Tasks</h3>
          <p style={{ marginTop: '16px', fontSize: '40px', fontWeight: '700', color: '#3b82f6' }}>+{overviewData.totalCards}</p>
        </div>
        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', borderRadius: '24px', padding: '20px', textAlign: 'center', maxWidth: '240px', width: '240px', height: '200px' }}>
          <Pie data={data} options={options} />
        </div>
      </div>
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568', marginBottom: '16px' }}>Project Details</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <thead style={{ backgroundColor: '#edf2f7' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Project Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Project Members</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Total Tasks</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Pending Tasks</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>In-Progress Tasks</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Completed Tasks</th>
                <th style={{ padding: '12px 16px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {overviewData.projects.map((project, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f7fafc' : 'white', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#edf2f7'} onMouseOut={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f7fafc' : 'white'}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.name}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.projectMembers.length}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCards}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalPendingCards}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalInProgressCards}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{project.totalCompletedCards}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                    <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '8px' }} onClick={() => handleViewProjectTasks(project.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
















