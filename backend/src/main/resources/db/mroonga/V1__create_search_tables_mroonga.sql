-- UTF-8
SET NAMES utf8mb4;

-- 프로젝트 검색 테이블
CREATE TABLE project_search
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id          BIGINT       NOT NULL,
    title               VARCHAR(255) NOT NULL,
    summary             TEXT NULL,
    duration            VARCHAR(100) NULL,
    price               DECIMAL(19, 2) NULL,
    `status`            VARCHAR(30) NULL,
    description         TEXT NULL,
    preferred_condition TEXT NULL,
    working_condition   TEXT NULL,

    -- 가중치 매칭용: 단일 컬럼 FT 인덱스
    FULLTEXT            INDEX ft_title (title)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    FULLTEXT            INDEX ft_pref  (preferred_condition)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    FULLTEXT            INDEX ft_work  (working_condition)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    -- 상태 필터 가속
    INDEX               idx_project_status (`status`)
) ENGINE=Mroonga
  DEFAULT CHARSET=utf8mb4
  COMMENT='프로젝트 검색 테이블';

-- 프리랜서 검색 테이블
CREATE TABLE freelancer_search
(
    id            BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    freelancer_id BIGINT NOT NULL,
    `status`      VARCHAR(20) NULL,
    job           VARCHAR(100) NULL,
    one_liner     TEXT NULL,
    career        TEXT NULL,
    rating_avg    FLOAT NULL,
    tech_stack    TEXT NULL,

    -- 가중치 매칭용: 단일 컬럼 FT 인덱스
    FULLTEXT      INDEX ft_job    (job)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    FULLTEXT      INDEX ft_career (career)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    FULLTEXT      INDEX ft_stack  (tech_stack)
      COMMENT 'tokenizer "TokenBigramSplitSymbolAlphaDigit", normalizer "NormalizerAuto"',
    INDEX         idx_freelancer_status (`status`)
) ENGINE=Mroonga
  DEFAULT CHARSET=utf8mb4
  COMMENT='프리랜서 검색 테이블';