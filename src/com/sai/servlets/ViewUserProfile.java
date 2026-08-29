package com.sai.servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sai.beans.UserBean;
import com.sai.constant.UserRole;
import com.sai.utility.TrainUtil;

@SuppressWarnings("serial")
@WebServlet("/viewuserprofile")
public class ViewUserProfile extends HttpServlet {
	protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
		res.setContentType("text/html");
		PrintWriter pw = res.getWriter();

		TrainUtil.validateUserAuthorization(req, UserRole.CUSTOMER);

		UserBean ub = TrainUtil.getCurrentCustomer(req);

		String photoTag = "Not Available";
		String uploadDirPath = getServletContext().getRealPath("/uploads");
		if (uploadDirPath != null) {
			java.io.File uploadDir = new java.io.File(uploadDirPath);
			String safePrefix = ub.getMailId().replaceAll("[^a-zA-Z0-9._-]", "_");
			java.io.File[] matches = uploadDir.listFiles((dir, name) -> name.startsWith(safePrefix + "."));
			if (matches != null && matches.length > 0) {
				photoTag = "<img src='uploads/" + matches[0].getName()
						+ "' style='max-width:110px; max-height:110px; border-radius:50%; object-fit:cover;'/>";
			}
		}

		RequestDispatcher rd = req.getRequestDispatcher("UserHome.html");
		rd.include(req, res);
		pw.println("<div class='profile-view' data-view='profile'>");
		pw.println("<div class='profile-photo-slot'>" + photoTag + "</div>");
		pw.println("<div class='profile-name'>" + ub.getFName() + " " + ub.getLName() + "</div>");
		pw.println("<div class='profile-email'>" + ub.getMailId() + "</div>");
		pw.println("<div class='profile-fields'>"
				+ "<div class='pf-row'><div class='pf-label'>First Name</div><div class='pf-value'>" + ub.getFName() + "</div></div>"
				+ "<div class='pf-row'><div class='pf-label'>Last Name</div><div class='pf-value'>" + ub.getLName() + "</div></div>"
				+ "<div class='pf-row'><div class='pf-label'>Email</div><div class='pf-value'>" + ub.getMailId() + "</div></div>"
				+ "<div class='pf-row'><div class='pf-label'>Address</div><div class='pf-value'>" + ub.getAddr() + "</div></div>"
				+ "<div class='pf-row'><div class='pf-label'>Phone</div><div class='pf-value'>" + ub.getPhNo() + "</div></div>"
				+ "</div>");
		pw.println("<div class='profile-actions'>"
				+ "<a class='btn ghost' href='edituserprofile'>Edit Profile</a>"
				+ "<a class='btn ghost' href='changeuserpassword'>Change Password</a>"
				+ "</div>");
		pw.println("</div>");

	}

}
