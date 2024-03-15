import React from "react";
import styles from "./userDashboard.module.css";
import {
  FaGoogle,
  FaSlack,
  FaTrello,
  FaMicrosoft,
  FaJira,
  FaGithub,
  FaDropbox,
  FaConfluence,
  FaSalesforce,
  FaBox,
  FaHubspot,
  FaEvernote,
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaFigma,
  FaChartLine,
  FaReact,
  FaGitlab,
  FaSpotify,
} from "react-icons/fa";
import { RiNotionFill } from "react-icons/ri";

// Define the app data with icon and name
const apps = [
  {
    icon: FaCalendarAlt,
    name: "Calendar",
    link: "https://calendar.google.com/",
  },
  { icon: FaEnvelope, name: "Mail", link: "https://gmail.com/" },
  { icon: RiNotionFill, name: "Notion", link: "https://www.notion.so/" },
  {
    icon: FaGoogle,
    name: "Google Workspace",
    link: "https://workspace.google.com/",
  },
  { icon: FaSlack, name: "Slack", link: "https://slack.com/" },
  { icon: FaTrello, name: "Trello", link: "https://trello.com/" },
  {
    icon: FaMicrosoft,
    name: "Microsoft Teams",
    link: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
  },
  {
    icon: FaJira,
    name: "Jira",
    link: "https://www.atlassian.com/software/jira",
  },
  { icon: FaGithub, name: "GitHub", link: "https://github.com/" },
  { icon: FaGitlab, name: "Gitlab", link: "https://gitlab.com/" },
  { icon: FaDropbox, name: "Dropbox", link: "https://www.dropbox.com/" },
  {
    icon: FaConfluence,
    name: "Confluence",
    link: "https://www.atlassian.com/software/confluence",
  },
  {
    icon: FaSalesforce,
    name: "Salesforce",
    link: "https://www.salesforce.com/",
  },
  { icon: FaBox, name: "Box", link: "https://www.box.com/" },
  { icon: FaHubspot, name: "HubSpot", link: "https://www.hubspot.com/" },
  { icon: FaEvernote, name: "Evernote", link: "https://evernote.com/" },
  { icon: FaFigma, name: "Figma", link: "https://www.figma.com/" },
  { icon: FaReact, name: "React", link: "https://react.dev/" },
  { icon: FaChartLine, name: "Charts", link: "https://www.lucidchart.com/" },
  { icon: FaSpotify, name: "Spotify", link: "https://www.spotify.com/" },
];

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.appGrid}>
        {apps.map((app, index) => (
          <a
            key={index}
            className={styles.appIcon}
            href={app.link}
            target="_blank"
          >
            <app.icon size={48} />
            <span>{app.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
