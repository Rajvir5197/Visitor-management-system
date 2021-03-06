package com.vms.Sevices;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import javax.mail.MessagingException;
import javax.mail.internet.AddressException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vms.Model.Asset;
import com.vms.Model.CoVisitor;
import com.vms.Model.Employee;
import com.vms.Model.MeetingStatus;
import com.vms.Model.Visitor;
import com.vms.Repository.AssetRepository;
import com.vms.Repository.CoVisitorRepository;
import com.vms.Repository.MeetingStatusRepository;
import com.vms.Repository.VisitorRepository;

import net.minidev.json.JSONObject;

@Service
public class SecurityService {

	@Autowired
	CoVisitorRepository coVisitorRepository;

	@Autowired
	AssetRepository assetRepository;

	@Autowired
	MeetingStatusRepository meetingStatusRepository;

	@Autowired
	VisitorRepository visitorRepository;

	@Autowired
	private JavaMailSender javaMailSender;

	Logger logger = LoggerFactory.getLogger(SecurityService.class);

	public JSONObject addCoVisitor(CoVisitor coVisitor) {

		logger.info(
				"start of addCoVisitor method with no. of covisitor: " + coVisitor.getVisitor().getNumberOfCoVisitor());

		JSONObject jsonObject = new JSONObject();
		coVisitor.setCreatedDate(Date.valueOf(LocalDate.now()));
		coVisitor.setCreatedTime(Time.valueOf(LocalTime.now()));

		// System.out.println(coVisitor.getVisitor().get);
		int v = coVisitor.getVisitor().getVisitorId();
		Optional<Visitor> vis = visitorRepository.findById(v);
		logger.info("no. of covisitor: " + vis.get().getNumberOfCoVisitor());
		if(coVisitor.getCoVisitorImage() != null) {
			coVisitor.setCoVisitorImage(compressBytes(coVisitor.getCoVisitorImage()));
		}
		CoVisitor coVisitorSaved = coVisitorRepository.save(coVisitor);
		vis.get().setNumberOfCoVisitor(vis.get().getNumberOfCoVisitor() + 1);
		Visitor visSaved = visitorRepository.save(vis.get());
		logger.info("after saving no. of covisitor: " + visSaved.getNumberOfCoVisitor());
		if (null != coVisitorSaved) {
			jsonObject.put("msg", "SUCCESS");
		} else {
			jsonObject.put("msg", "FAIL");
		}

		/*
		 * if (null != coVisitorSaved) { int numberOfCovisitor =
		 * coVisitorSaved.getVisitor().getNumberOfCoVisitor();
		 * coVisitorSaved.getVisitor().setNumberOfCoVisitor(numberOfCovisitor+1);
		 * logger.info("no. of covisitor: "+coVisitorSaved.getVisitor().
		 * getNumberOfCoVisitor()); //CoVisitor coVisitorSaved1 =
		 * coVisitorRepository.save(coVisitorSaved); Visitor visitorSaved =
		 * visitorRepository.save(coVisitorSaved.getVisitor());
		 * logger.info("no. of covisitor: "+visitorSaved.getNumberOfCoVisitor()); if
		 * (null != visitorSaved) { jsonObject.put("msg", "SUCCESS"); } else {
		 * jsonObject.put("msg", "FAIL"); } } else { jsonObject.put("msg", "FAIL"); }
		 */
		return jsonObject;

	}

	public List<CoVisitor> viewAllCoVisitor(MeetingStatus meeting) {

		List<CoVisitor> allCoVisitor = coVisitorRepository.findByVisitor(meeting.getMeetingBooked().getVisitor());
		for(CoVisitor coVisitor: allCoVisitor) {
			if(coVisitor.getCoVisitorImage() != null) {
				coVisitor.setCoVisitorImage(decompressBytes(coVisitor.getCoVisitorImage()));
			}
		}
		return allCoVisitor;
	}

	public List<Asset> getAllAsset(CoVisitor coVisitor) {

		List<Asset> CoVisitor = assetRepository.findByVisitor(coVisitor);

		return CoVisitor;
	}

	public JSONObject addCoVisitorAsset(@RequestBody Asset asset) {

		JSONObject jsonObject = new JSONObject();
		if (asset.getMainVisitor() != null) {
			int v = asset.getMainVisitor().getVisitorId();
			Optional<Visitor> vis = visitorRepository.findById(v);
			asset.setMainVisitor(vis.get());
		}

		Asset assetSaved = assetRepository.save(asset);
		if (null != assetSaved) {
			jsonObject.put("msg", "SUCCESS");
		} else {
			jsonObject.put("msg", "FAIL");
		}
		return jsonObject;

	}

	public JSONObject securityCheckin(MeetingStatus meeting) {

		JSONObject jsonObject = new JSONObject();
		try {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			Optional<MeetingStatus> udatedMeeting = meetingStatusRepository.findById(meeting.getMeetingId());
			udatedMeeting.get().setLastUpdatedDate(Date.valueOf(LocalDate.now()));
			udatedMeeting.get().setLastUpdatedTime(Time.valueOf(LocalTime.now()));
			udatedMeeting.get().setStatus("Sec Checked In");
			udatedMeeting.get().setSecCheckin(true);
			udatedMeeting.get().setSecCheckinDate(Date.valueOf(LocalDate.now()));
			udatedMeeting.get().setSecCheckinTime(Time.valueOf(LocalTime.now()));

			MeetingStatus meetingSaved = meetingStatusRepository.save(udatedMeeting.get());
			if (null != meetingSaved) {
				jsonObject.put("msg", "SUCCESS");
			} else {
				jsonObject.put("msg", "FAIL");
			}
		} catch (Exception e) {
			e.printStackTrace();
			jsonObject.put("msg", "FAIL");
		}
		return jsonObject;

	}

	public JSONObject securityCheckout(MeetingStatus meeting) {

		JSONObject jsonObject = new JSONObject();
		try {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			Optional<MeetingStatus> udatedMeeting = meetingStatusRepository.findById(meeting.getMeetingId());
			udatedMeeting.get().setLastUpdatedDate(Date.valueOf(LocalDate.now()));
			udatedMeeting.get().setLastUpdatedTime(Time.valueOf(LocalTime.now()));
			udatedMeeting.get().setStatus("Sec Checked Out");
			udatedMeeting.get().setSecCheckout(true);
			udatedMeeting.get().setSecCheckoutDate(Date.valueOf(LocalDate.now()));
			udatedMeeting.get().setSecCheckoutTime(Time.valueOf(LocalTime.now()));

			MeetingStatus meetingSaved = meetingStatusRepository.save(udatedMeeting.get());
			//sendMessage(meetingSaved);
			if (null != meetingSaved) {
				jsonObject.put("msg", "SUCCESS");
			} else {
				jsonObject.put("msg", "FAIL");
			}
		} catch (Exception e) {
			e.printStackTrace();
			jsonObject.put("msg", "FAIL");
		}
		return jsonObject;

	}

	public JSONObject addVisitorImage(MeetingStatus visitor) {

		// logger.info("start of addOrEditEmployee method");
		JSONObject jsonObject = new JSONObject();
		List<Visitor> visitorForBatch = visitorRepository.findByBatchStatus("assigned");
		List<CoVisitor> coVisitorForBatch = coVisitorRepository.findByBatchStatus("assigned");
		boolean batchPresent = false;
		if(visitorForBatch.size() > 0) {
			for(Visitor v : visitorForBatch) {
				if(v.getBatchNo() == visitor.getMeetingBooked().getVisitor().getBatchNo()) {
					batchPresent = true;
				}
			}
		}
		
		if(coVisitorForBatch.size() > 0) {
			for(CoVisitor v : coVisitorForBatch) {
				if(v.getBatchNo() == visitor.getMeetingBooked().getVisitor().getBatchNo()) {
					batchPresent = true;
				}
			}
		}
		
		if(batchPresent) {
			jsonObject.put("data", "BatchPresent");
			return jsonObject;
		}
		
		Optional<MeetingStatus> meet = meetingStatusRepository.findById(visitor.getMeetingId());
		meet.get().getMeetingBooked().getVisitor()
				.setVisitorImage(compressBytes(visitor.getMeetingBooked().getVisitor().getVisitorImage()));
		meet.get().getMeetingBooked().getVisitor().setArogyaPresent(visitor.getMeetingBooked().getVisitor().isArogyaPresent());
		meet.get().getMeetingBooked().getVisitor().setBatchNo(visitor.getMeetingBooked().getVisitor().getBatchNo());
		meet.get().getMeetingBooked().getVisitor().setBatchStatus(visitor.getMeetingBooked().getVisitor().getBatchStatus());
		meet.get().getMeetingBooked().getVisitor().setBodyTemperature(visitor.getMeetingBooked().getVisitor().getBodyTemperature());

		MeetingStatus visitorSaved = meetingStatusRepository.save(meet.get());
		if (null != visitorSaved) {
			jsonObject.put("data", "SUCCESS");
		} else {
			jsonObject.put("data", "FAIL");
		}
		return jsonObject;
	}
	
	public JSONObject addCoVisitorImage(CoVisitor coVisitor) {

		JSONObject jsonObject = new JSONObject();
		
		List<Visitor> visitorForBatch = visitorRepository.findByBatchStatus("assigned");
		List<CoVisitor> coVisitorForBatch = coVisitorRepository.findByBatchStatus("assigned");
		boolean batchPresent = false;
		if(visitorForBatch.size() > 0) {
			for(Visitor v : visitorForBatch) {
				if(v.getBatchNo() == coVisitor.getBatchNo()) {
					batchPresent = true;
				}
			}
		}
		
		if(coVisitorForBatch.size() > 0) {
			for(CoVisitor v : coVisitorForBatch) {
				if(v.getBatchNo() == coVisitor.getBatchNo()) {
					batchPresent = true;
				}
			}
		}
		
		if(batchPresent) {
			jsonObject.put("data", "BatchPresent");
			return jsonObject;
		}
		
		coVisitor.setCoVisitorImage(compressBytes(coVisitor.getCoVisitorImage()));

		CoVisitor savedCoVisitor = coVisitorRepository.save(coVisitor);
		if (null != savedCoVisitor) {
			jsonObject.put("data", "SUCCESS");
		} else {
			jsonObject.put("data", "FAIL");
		}
		return jsonObject;
	}

	// compress the image bytes before storing it in the database
	public static byte[] compressBytes(byte[] data) {
		Deflater deflater = new Deflater();
		deflater.setInput(data);
		deflater.finish();
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
		byte[] buffer = new byte[1024];
		while (!deflater.finished()) {
			int count = deflater.deflate(buffer);
			outputStream.write(buffer, 0, count);
		}
		try {
			outputStream.close();
		} catch (IOException e) {
		}
		System.out.println("before compressed" + data.length);
		System.out.println("Compressed Image Byte Size - " + outputStream.toByteArray().length);
		return outputStream.toByteArray();
	}

	// uncompress the image bytes before returning it to the angular application
	public static byte[] decompressBytes(byte[] data) {
		Inflater inflater = new Inflater();
		inflater.setInput(data);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
		byte[] buffer = new byte[1024];
		try {
			while (!inflater.finished()) {
				int count = inflater.inflate(buffer);
				outputStream.write(buffer, 0, count);
			}
			outputStream.close();
		} catch (IOException ioe) {
		} catch (DataFormatException e) {

		}
		return outputStream.toByteArray();
	}

	/*
	 * public JSONObject sendEmail(MeetingStatus meeting) {
	 * 
	 * JSONObject jsonObject = new JSONObject(); try { // Construct data List<Asset>
	 * assetDetailsMAin =
	 * assetRepository.findByMainVisitor(meeting.getMeetingBooked().getVisitor());
	 * String AssetDetailsM = ""; for (Asset as : assetDetailsMAin) { AssetDetailsM
	 * = AssetDetailsM + as.getAssetName() + ":" + as.getAssetCount() + "\n"; }
	 * List<CoVisitor> CoVisitorList =
	 * coVisitorRepository.findByVisitor(meeting.getMeetingBooked().getVisitor());
	 * int count = CoVisitorList.size(); String AssetDetails = ""; for (CoVisitor CV
	 * : CoVisitorList) { List<Asset> assetDetails =
	 * assetRepository.findByVisitor(CV); for (Asset as : assetDetails) {
	 * AssetDetails = AssetDetails + CV.getCoVisitorName() + ":" + as.getAssetName()
	 * + ":" + as.getAssetCount() + "\n"; }
	 * 
	 * } String message1 = ""; if(meeting.isSecCheckout()) { message1 =
	 * "Thank you for your visit \n" +
	 * "Please find Asset details at the time of check-out: \n" + "Main Asset : \n"
	 * + AssetDetailsM + "\n" + "Number of Co-visitor: " + count + "\n" +
	 * "Asset details: \n" + AssetDetails + "Thanks/Regard"; }else { message1 =
	 * "Hello Visitor: \n" + "Please find checkin Details below: \n" +
	 * "Main Asset : \n" + AssetDetailsM + "\n" + "Number of Co-visitor: " + count +
	 * "\n" + "Asset details: \n" + AssetDetails + "Thanks/Regard"; }
	 * sendmail(meeting.getMeetingBooked().getVisitor().getEmailId(),message1);
	 * 
	 * } catch (Exception e) { System.out.println("Error SMS "+e); }
	 * jsonObject.put("msg", "SUCCESS"); return jsonObject; }
	 * 
	 * public String sendMessage(@RequestBody MeetingStatus meeting) {
	 * 
	 * 
	 * URL url = null; BufferedReader reader = null; StringBuilder stringBuilder =
	 * new StringBuilder(); SimpleDateFormat sdf = new
	 * SimpleDateFormat("dd-MM-yyyy"); try {
	 * 
	 * try { // Construct data List<Asset> assetDetailsMAin =
	 * assetRepository.findByMainVisitor(meeting.getMeetingBooked().getVisitor());
	 * String AssetDetailsM = ""; for (Asset as : assetDetailsMAin) { AssetDetailsM
	 * = AssetDetailsM + as.getAssetName() + ":" + as.getAssetCount() + "\n"; }
	 * List<CoVisitor> CoVisitorList =
	 * coVisitorRepository.findByVisitor(meeting.getMeetingBooked().getVisitor());
	 * int count = CoVisitorList.size(); String AssetDetails = ""; for (CoVisitor CV
	 * : CoVisitorList) { List<Asset> assetDetails =
	 * assetRepository.findByVisitor(CV); for (Asset as : assetDetails) {
	 * AssetDetails = AssetDetails + CV.getCoVisitorName() + ":" + as.getAssetName()
	 * + ":" + as.getAssetCount() + "\n"; }
	 * 
	 * } String message1 = ""; if(meeting.isSecCheckout()) { message1 =
	 * "Thank you for your visit \n" +
	 * "Please find Asset details at the time of check-out: \n" + "Main Asset : \n"
	 * + AssetDetailsM + "\n" + "Number of Co-visitor: " + count + "\n" +
	 * "Asset details: \n" + AssetDetails + "Thanks/Regard"; }else { message1 =
	 * "Hello Visitor: \n" + "Please find checkin Details below: \n" +
	 * "Main Asset : \n" + AssetDetailsM + "\n" + "Number of Co-visitor: " + count +
	 * "\n" + "Asset details: \n" + AssetDetails + "Thanks/Regard"; } //String
	 * message = message1.replaceAll(" ", "%20"); // create the HttpURLConnection
	 * 
	 * String urlStr =
	 * "http://bulksms.vrudheesolutions.com/api/mt/SendSMS?APIKey=R8ntvc8nnU26zeAGiN0U0A&senderid=ERUCHA&channel=2&DCS=0&flashsms=0&number="
	 * +meeting.getMeetingBooked().getVisitor().getContactNumber()+"&text="+message+
	 * "&route=1"; logger.info(urlStr); url = new URL(urlStr); HttpURLConnection
	 * connection = (HttpURLConnection) url.openConnection();
	 * connection.addRequestProperty("User-Agent",
	 * "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
	 * 
	 * // give it 15 seconds to respond connection.setReadTimeout(15*1000);
	 * connection.connect();
	 * 
	 * // read the output from the server reader = new BufferedReader(new
	 * InputStreamReader(connection.getInputStream()));
	 * 
	 * 
	 * String line = null; while ((line = reader.readLine()) != null) {
	 * stringBuilder.append(line + "\n"); }
	 * 
	 * sendmail(meeting.getMeetingBooked().getVisitor().getEmailId(),message1);
	 * 
	 * } catch (Exception e) { System.out.println("Error SMS "+e); return
	 * "Error "+e; } return ("SUCCESS"); }
	 * 
	 * public void sendmail(String MailTo, String message) throws AddressException,
	 * MessagingException, IOException { SimpleMailMessage msg = new
	 * SimpleMailMessage();
	 * //msg.setFrom("raj.viradiya@syscort.com");no-reply@rucha.co.in
	 * msg.setFrom("no-reply@rucha.co.in"); msg.setTo(MailTo);
	 * 
	 * msg.setSubject("Meeting Details"); msg.setText(message);
	 * 
	 * System.out.println("sending msg"); javaMailSender.send(msg);
	 * System.out.println("sent msg"); }
	 */

	public List<Asset> getVisitAllAsset(Visitor visitor) {

		List<Asset> Visitor = assetRepository.findByMainVisitor(visitor);

		return Visitor;
	}

	public JSONObject submitBatch(MeetingStatus meeting) {
		
		JSONObject jsonObject = new JSONObject();
		Optional<Visitor> visitor = visitorRepository.findById(meeting.getMeetingBooked().getVisitor().getVisitorId());
		visitor.get().setBatchStatus("submited");
		visitorRepository.save(visitor.get());
		
		List<CoVisitor> allCovisitor = coVisitorRepository.findByVisitor(visitor.get());
		for(CoVisitor covisitor: allCovisitor) {
			covisitor.setBatchStatus("submited");
			coVisitorRepository.save(covisitor);
		}
		jsonObject.put("msg", "SUCCESS");
		return jsonObject;
	}

	public JSONObject deleteAsset(Asset asset) {
		JSONObject jsonObject = new JSONObject();
		/*
		 * if (asset.getMainVisitor() != null) { int v =
		 * asset.getMainVisitor().getVisitorId(); Optional<Visitor> vis =
		 * visitorRepository.findById(v); asset.setMainVisitor(vis.get()); }
		 */

		assetRepository.delete(asset);
		jsonObject.put("msg", "SUCCESS");
		return jsonObject;
	}


}
