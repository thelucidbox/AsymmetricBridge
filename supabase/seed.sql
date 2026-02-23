-- Asymmetric Bridge: Seed Data
-- Initial signal statuses from source JSX files

-- ============================================
-- SIGNAL STATUSES (24 signals across 6 dominos)
-- ============================================

-- Domino 1: SaaS Compression
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(1, 'Public SaaS Net Revenue Retention', 'amber', 'Watch Q1 2026 earnings cycle closely', 'seed'),
(1, 'Indeed SaaS Sales Job Postings', 'amber', 'Track SaaS, Account Executive, SDR categories', 'seed'),
(1, 'Y Combinator Replace X Startups', 'amber', 'Count startups explicitly positioning as SaaS replacements', 'seed'),
(1, 'Enterprise Software Spending Forecasts', 'green', 'Distinguish between AI spend (up) and legacy SaaS (down)', 'seed');

-- Domino 2: White-Collar Displacement
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(2, 'JOLTS: Professional Services Openings', 'amber', 'Compare professional services vs. blue collar divergence', 'seed'),
(2, 'BLS Employment: Information Sector', 'amber', 'Also track financial activities and professional services', 'seed'),
(2, 'Challenger Layoff Announcements (Tech/Finance)', 'amber', 'Watch for AI or efficiency cited as reason', 'seed'),
(2, 'Initial Jobless Claims Composition', 'green', 'The article crisis trigger was 487K', 'seed');

-- Domino 3: Friction Collapse
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(3, 'DoorDash/Uber Eats Take Rate', 'green', 'Watch for mentions of multi-platform or agent in earnings calls', 'seed'),
(3, 'Visa/Mastercard Purchase Volume Growth', 'green', 'Article cited MA Q1 2027 at +3.4% as inflection', 'seed'),
(3, 'Stablecoin Transaction Volume', 'green', 'Solana + Ethereum L2 volumes specifically', 'seed'),
(3, 'Real Estate Commission Compression', 'amber', 'NAR settlement already started this trend', 'seed');

-- Domino 4: Ghost GDP
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(4, 'GDP Growth vs. Real Wage Growth Spread', 'amber', 'The key diagnostic: productivity up, wages down', 'seed'),
(4, 'M2 Velocity of Money', 'amber', 'Already at historic lows; further decline = systemic', 'seed'),
(4, 'Consumer Confidence vs. CEO Confidence', 'green', 'CEOs bullish on AI, consumers bearish on jobs', 'seed'),
(4, 'Labor Share of GDP', 'amber', 'Article projected drop to 46% by 2028', 'seed');

-- Domino 5: Financial Contagion
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(5, 'PE-Backed Software Default Rate', 'green', 'Watch for sector-wide downgrades like 2015 energy', 'seed'),
(5, 'Alt Manager Stock Prices (BX, APO, KKR)', 'green', 'Insurance subsidiary exposure is the transmission mechanism', 'seed'),
(5, 'Prime Mortgage Delinquency (Tech Metros)', 'green', 'Watch HELOC draws and 401k withdrawals as leading indicators', 'seed'),
(5, 'NAIC Insurance Capital Actions', 'green', 'The Athene/Apollo scenario from the article', 'seed');

-- Domino 6: Policy Response
INSERT INTO signal_statuses (domino_id, signal_name, status, notes, updated_by) VALUES
(6, 'Congressional AI Legislation Activity', 'amber', 'Watch for compute tax, transition economy, AI dividend', 'seed'),
(6, 'Fed Language: Structural vs. Cyclical', 'green', 'The article has Warsh using daisy chain in Nov 2027', 'seed'),
(6, 'Federal Receipts vs. CBO Baseline', 'green', 'Article cites 12% below baseline by Q1 2028', 'seed'),
(6, 'Deficit Trajectory', 'amber', 'Compare to COVID 15% — but that was understood as temporary', 'seed');

-- ============================================
-- INITIAL DATA POINTS
-- ============================================

INSERT INTO signal_data_points (domino_id, signal_name, date, value, status, source) VALUES
(1, 'Public SaaS Net Revenue Retention', 'Q3 2025', '118% avg', 'amber', 'Quarterly earnings (SNOW, NOW, CRM, ZS)');

-- ============================================
-- ASSESSMENTS (from source materials)
-- ============================================

INSERT INTO assessments (section, assessment, confidence) VALUES
('source_citrini', 'Direction plausible, speed compressed (5-8 years into 2). Underweights institutional drag, legal friction, deployment difficulty. 45% probability of Slow Grind variant.', 'MEDIUM'),
('source_leopold', 'Capability trajectory largely validated by events since publication (Claude 3.5 → 4, o1/o3, Gemini 2.0). Timeline aggressive but defensible. Weaker on economic/social consequences — focuses on capability, not distribution.', 'MEDIUM'),
('source_bull_rebuttal', 'This is essentially our New Guilds variant (20% probability) + Bifurcation variant (20%). Compelling counter-argument. The truth likely lives between Citrini bear case and this bull case.', 'MEDIUM'),
('source_bond_trade', 'Useful for understanding how the thesis maps to actual tradeable instruments. Less relevant for our equity-focused portfolio but worth tracking for macro signals.', 'LOW'),
('synthesis', 'Leopold tells you WHAT is being built. Citrini tells you WHO gets hurt when it arrives. The Boom rebuttal tells you who ADAPTS. Your strategy needs to account for all three: position for the capability buildout (AI infrastructure), hedge against the displacement (hard assets), and BUILD the adaptation (Lucid Box — you ARE the New Guilds thesis in action).', 'HIGH');
