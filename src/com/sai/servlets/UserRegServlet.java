package com.sai.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.File;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.sai.beans.TrainException;
import com.sai.beans.UserBean;
import com.sai.constant.UserRole;
import com.sai.service.UserService;
import com.sai.service.impl.UserServiceImpl;

@SuppressWarnings("serial")
@WebServlet("/userreg")
@MultipartConfig(maxFileSize = 2 * 1024 * 1024) // 2MB limit
public class UserRegServlet extends HttpServlet {

	private UserService userService = new UserServiceImpl(UserRole.CUSTOMER);

	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
		res.setContentType("text/html");
		PrintWriter pw = res.getWriter();
		try {
			UserBean user = new UserBean();
			user.setMailId(req.getParameter("mailid"));
			user.setPWord(req.getParameter("pword"));
			user.setFName(req.getParameter("firstname"));
			user.setLName(req.getParameter("lastname"));
			user.setAddr(req.getParameter("address"));
			user.setPhNo(Long.parseLong(req.getParameter("phoneno")));

			String message = userService.registerUser(user);
			if ("SUCCESS".equalsIgnoreCase(message)) {
				savePhotoIfPresent(req, user.getMailId());
				RequestDispatcher rd = req.getRequestDispatcher("UserLogin.html");
				rd.include(req, res);
				pw.println("<div class='tab'><p1 class='menu'>User Registered Successfully !</p1></div>");

			} else {
				RequestDispatcher rd = req.getRequestDispatcher("UserRegister.html");
				rd.include(req, res);
				pw.println("<div class='tab'><p1 class='menu'>" + message + "</p1></div>");

			}

		} catch (Exception e) {
			throw new TrainException(422, this.getClass().getName() + "_FAILED", e.getMessage());
		}
	}

	private void savePhotoIfPresent(HttpServletRequest req, String mailId) throws IOException, ServletException {
		Part filePart = req.getPart("userphoto");
		if (filePart == null || filePart.getSize() == 0) {
			return; // no photo selected, nothing to do
		}
		String submittedName = filePart.getSubmittedFileName();
		String extension = "";
		if (submittedName != null && submittedName.contains(".")) {
			extension = submittedName.substring(submittedName.lastIndexOf('.'));
		}
		String safeFileName = mailId.replaceAll("[^a-zA-Z0-9._-]", "_") + extension;
		String uploadDirPath = getServletContext().getRealPath("/uploads");
		File uploadDir = new File(uploadDirPath);
		if (!uploadDir.exists()) {
			uploadDir.mkdirs();
		}
		filePart.write(uploadDirPath + File.separator + safeFileName);
	}

}
