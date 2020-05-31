package com.vms.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vms.Model.MeetingStatus;
import com.vms.Model.Meetings;

@Repository
public interface MeetingMasterRepository extends JpaRepository<Meetings, Integer>{
	

}