package com.ecopedia.core.terminal.data;

import com.ecopedia.core.terminal.domain.Station;
import com.ecopedia.core.terminal.domain.StationRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaStationRepository extends JpaRepository<Station, Long>, StationRepository {

    @Override
    @Query("SELECT s FROM Station s WHERE s.active = true")
    List<Station> findAllActive();
}
