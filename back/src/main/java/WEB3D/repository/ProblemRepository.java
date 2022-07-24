package WEB3D.repository;

import WEB3D.domain.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Problem findByStageAndNumber(int stage, int number);
    List<Problem> findAllByStage(int stage);
}
