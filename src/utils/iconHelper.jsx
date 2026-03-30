import React from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  FileText,
  Layout,
  PenTool,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";

export const getIcon = (iconName, className = "") => {
  const icons = {
    Video: <Video size={18} />,
    FileText: <FileText size={18} />,
    CheckSquare: <CheckSquare size={18} />,
    Award: <Award size={18} />,
    BookOpen: <BookOpen size={18} />,
    PlayCircle: <PlayCircle size={18} />,
    PenTool: <PenTool size={18} />,
    RotateCcw: <RotateCcw size={18} />,
    ArrowRight: <ArrowRight size={18} />,
    ClipboardCheck: <ClipboardCheck size={18} />,
    Layout: <Layout size={18} />,
    Users: <Users size={18} />,
    Zap: <Zap size={18} />,
    Sparkles: <Sparkles size={18} />,
  };

  const iconElement = icons[iconName] || <BookOpen size={18} />;
  return React.cloneElement(iconElement, {
    className: `${iconElement.props.className || ""} ${className}`.trim(),
  });
};
